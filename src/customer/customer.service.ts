import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto) {
    await this.ensureCustomerExists(userId);

    return this.prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async getOrders(userId: string) {
    await this.ensureCustomerExists(userId);

    return this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getCart(userId: string) {
    await this.ensureCustomerExists(userId);

    const cart = await this.prisma.cart.findUnique({
      where: { customerId: userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                status: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = Number(
      cart.items
        .reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0,
        )
        .toFixed(2),
    );

    return {
      ...cart,
      totalItems,
      totalAmount,
    };
  }

  async deactivateAccount(userId: string) {
    const user = await this.ensureCustomerExists(userId);

    if (!user.isActive) {
      return {
        message: 'Customer account is already deactivated',
      };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return {
      message: 'Customer account deactivated successfully',
    };
  }

  private async ensureCustomerExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    return user;
  }
}
