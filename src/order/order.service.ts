import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly orderInclude = {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            store: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    },
    customer: {
      select: {
        id: true,
        email: true,
      },
    },
  };

  async checkout(customerId: string) {
    await this.ensureCustomerActive(customerId);

    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      if (item.product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(
          `Product ${item.product.name} is not available`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }

      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          customerId,
          status: OrderStatus.PENDING,
          totalAmount: Number(totalAmount.toFixed(2)),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: this.orderInclude,
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    return order;
  }

  async findCustomerOrders(customerId: string, query?: PaginationQueryDto) {
    await this.ensureCustomerActive(customerId);
    const { page, limit, skip, take } = getPaginationParams(query);
    const where = { customerId };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: this.orderInclude,
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findCustomerOrderById(customerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(customerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: this.orderInclude,
      });
    });
  }

  async findVendorOrders(vendorId: string, query?: PaginationQueryDto) {
    await this.ensureVendorActive(vendorId);
    const { page, limit, skip, take } = getPaginationParams(query);
    const where = {
      items: {
        some: {
          product: {
            store: {
              ownerId: vendorId,
            },
          },
        },
      },
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          ...this.orderInclude,
          items: {
            where: {
              product: {
                store: {
                  ownerId: vendorId,
                },
              },
            },
            include: this.orderInclude.items.include,
          },
        },
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async shipOrder(vendorId: string, orderId: string) {
    await this.ensureVendorActive(vendorId);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: {
              store: { ownerId: vendorId },
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allOwnedByVendor = order.items.every(
      (item) => item.product.store.ownerId === vendorId,
    );

    if (!allOwnedByVendor) {
      throw new BadRequestException(
        'Order contains items from multiple stores; admin must update status',
      );
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Order must be confirmed before it can be shipped',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
      include: this.orderInclude,
    });
  }

  async listAllOrders(query?: PaginationQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: this.orderInclude,
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    await this.ensureOrderExists(orderId);

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: this.orderInclude,
    });
  }

  async confirmOrderForPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      return order;
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
      include: this.orderInclude,
    });
  }

  async cancelOrderForPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      return order;
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: this.orderInclude,
      });
    });
  }

  private async ensureOrderExists(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
  }

  private async ensureCustomerActive(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || user.role !== Role.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Customer account is deactivated');
    }
  }

  private async ensureVendorActive(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || user.role !== Role.VENDOR) {
      throw new NotFoundException('Vendor not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Vendor account is deactivated');
    }
  }
}
