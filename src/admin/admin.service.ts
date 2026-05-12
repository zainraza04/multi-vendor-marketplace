import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../common/utils/pagination';

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

  async listUsers(query?: PaginationQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
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

  async listStores(query?: PaginationQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.store.count(),
      this.prisma.store.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async verifyStore(storeId: string, isVerified: boolean) {
    await this.ensureStoreExists(storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: { isVerified },
    });
  }

  async listProducts(query?: PaginationQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.findMany({
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
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
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
