import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const slug = this.slugify(name);

    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.create({
      data: {
        name,
        slug,
      },
    });
  }

  async update(categoryId: string, dto: UpdateCategoryDto) {
    await this.ensureCategoryExists(categoryId);

    if (!dto.name) {
      return this.prisma.category.findUnique({
        where: { id: categoryId },
      });
    }

    const name = dto.name.trim();
    const slug = this.slugify(name);

    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
        NOT: { id: categoryId },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
      },
    });
  }

  async remove(categoryId: string) {
    await this.ensureCategoryExists(categoryId);

    await this.prisma.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }
}
