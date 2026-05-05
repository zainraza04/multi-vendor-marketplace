import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.store.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async findOwnedById(ownerId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async create(ownerId: string, dto: CreateStoreDto) {
    await this.ensureVendorExists(ownerId);

    return this.prisma.store.create({
      data: {
        ...dto,
        ownerId,
      },
    });
  }

  async update(ownerId: string, storeId: string, dto: UpdateStoreDto) {
    await this.ensureStoreOwnership(ownerId, storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: dto,
    });
  }

  async remove(ownerId: string, storeId: string) {
    await this.ensureStoreOwnership(ownerId, storeId);

    await this.prisma.store.delete({
      where: { id: storeId },
    });

    return { message: 'Store deleted successfully' };
  }

  private async ensureVendorExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || user.role !== 'VENDOR') {
      throw new NotFoundException('Vendor not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Vendor account is deactivated');
    }
  }

  private async ensureStoreOwnership(ownerId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId,
      },
      select: { id: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }
  }
}
