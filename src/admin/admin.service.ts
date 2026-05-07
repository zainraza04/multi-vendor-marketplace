import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [users, vendors, customers, admins, stores, products, orders] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.VENDOR } }),
        this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
        this.prisma.user.count({ where: { role: Role.ADMIN } }),
        this.prisma.store.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
      ]);

    return {
      users,
      vendors,
      customers,
      admins,
      stores,
      products,
      orders,
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
      },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    await this.ensureUserExists(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { profile: true },
    });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    await this.ensureUserExists(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: { profile: true },
    });
  }

  async listStores() {
    return this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyStore(storeId: string, isVerified: boolean) {
    await this.ensureStoreExists(storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: { isVerified },
    });
  }

  async listProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async updateProductStatus(productId: string, status: ProductStatus) {
    await this.ensureProductExists(productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureStoreExists(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
