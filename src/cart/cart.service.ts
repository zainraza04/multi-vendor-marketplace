import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly cartInclude = {
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
  };

  async getCart(customerId: string) {
    await this.ensureCustomerActive(customerId);
    return this.buildCartSummary(customerId);
  }

  async addItem(customerId: string, dto: AddCartItemDto) {
    await this.ensureCustomerActive(customerId);

    const quantity = dto.quantity ?? 1;
    const cart = await this.ensureCart(customerId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      select: { id: true, quantity: true },
    });

    const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;
    await this.ensureProductAvailable(dto.productId, desiredQuantity);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity,
      },
    });

    return this.buildCartSummary(customerId);
  }

  async updateItem(
    customerId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ) {
    await this.ensureCustomerActive(customerId);
    await this.ensureProductAvailable(productId, dto.quantity);

    const cart = await this.ensureCart(customerId);

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: dto.quantity,
      },
    });

    return this.buildCartSummary(customerId);
  }

  async removeItem(customerId: string, productId: string) {
    await this.ensureCustomerActive(customerId);

    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      select: { id: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.buildCartSummary(customerId);
  }

  async clearCart(customerId: string) {
    await this.ensureCustomerActive(customerId);

    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      select: { id: true },
    });

    if (!cart) {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.buildCartSummary(customerId);
  }

  private async ensureCart(customerId: string) {
    return this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      select: { id: true },
    });
  }

  private async buildCartSummary(customerId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: this.cartInclude,
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

  private async ensureProductAvailable(productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        status: true,
        stock: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock for ${product.name}`);
    }
  }
}
