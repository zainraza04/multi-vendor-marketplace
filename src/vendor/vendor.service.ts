import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { CreateStoreDto } from '../store/dto/create-store.dto';
import { UpdateStoreDto } from '../store/dto/update-store.dto';
import { StoreService } from '../store/store.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeService: StoreService,
  ) {}

  async getMe(userId: string) {
    const vendor = await this.prisma.user.findUnique({
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
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const storeCount = await this.prisma.store.count({
      where: { ownerId: userId },
    });

    return {
      ...vendor,
      _count: {
        stores: storeCount,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateVendorProfileDto) {
    await this.ensureVendorExists(userId);

    return this.prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async getStores(userId: string, query?: PaginationQueryDto) {
    await this.ensureVendorExists(userId);

    return this.storeService.findByOwner(userId, query);
  }

  async getStoreById(userId: string, storeId: string) {
    await this.ensureVendorExists(userId);

    return this.storeService.findOwnedById(userId, storeId);
  }

  async createStore(userId: string, dto: CreateStoreDto) {
    return this.storeService.create(userId, dto);
  }

  async updateStore(userId: string, storeId: string, dto: UpdateStoreDto) {
    return this.storeService.update(userId, storeId, dto);
  }

  async deleteStore(userId: string, storeId: string) {
    return this.storeService.remove(userId, storeId);
  }

  async deactivateAccount(userId: string) {
    const vendor = await this.ensureVendorExists(userId);

    if (!vendor.isActive) {
      return {
        message: 'Vendor account is already deactivated',
      };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return {
      message: 'Vendor account deactivated successfully',
    };
  }

  private async ensureVendorExists(userId: string) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        role: true,
      },
    });

    if (!vendor || vendor.role !== 'VENDOR') {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  // Store ownership checks are handled by StoreService when mutating.
}
