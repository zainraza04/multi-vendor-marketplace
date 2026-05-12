import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../common/utils/pagination';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeService: StoreService,
  ) {}

  private readonly productSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    imageUrl: true,
    status: true,
    storeId: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
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
  };

  async findAll(query: ProductQueryDto) {
    const where = {
      status: ProductStatus.ACTIVE,
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: this.productSelect,
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
      },
      select: this.productSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findVendorProducts(ownerId: string, query?: ProductQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);
    const where = {
      store: {
        ownerId,
      },
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: this.productSelect,
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async create(ownerId: string, dto: CreateProductDto) {
    await this.ensureVendorActive(ownerId);
    await this.storeService.findOwnedById(ownerId, dto.storeId);
    await this.ensureCategoryExists(dto.categoryId);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        imageUrl: dto.imageUrl,
        status: dto.status ?? ProductStatus.DRAFT,
        storeId: dto.storeId,
        categoryId: dto.categoryId,
      },
      select: this.productSelect,
    });
  }

  async update(ownerId: string, productId: string, dto: UpdateProductDto) {
    await this.ensureOwnedProduct(ownerId, productId);
    await this.ensureCategoryExists(dto.categoryId);

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        imageUrl: dto.imageUrl,
        status: dto.status,
        categoryId: dto.categoryId,
      },
      select: this.productSelect,
    });
  }

  async remove(ownerId: string, productId: string) {
    await this.ensureOwnedProduct(ownerId, productId);

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product deleted successfully' };
  }

  private async ensureOwnedProduct(ownerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId,
        },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureVendorActive(userId: string) {
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

  private async ensureCategoryExists(categoryId?: string) {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}
