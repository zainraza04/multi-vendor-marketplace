import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeUser(user: User) {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async findAll(query?: PaginationQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const [total, users] = await this.prisma.$transaction([
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
      data: users.map((user) => this.sanitizeUser(user)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findMe(userId: string) {
    return this.findOne(userId);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.ensureUserExists(id);

    const { firstName, lastName, phone, avatarUrl, ...rawUserData } =
      updateUserDto;

    if (rawUserData.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: rawUserData.email },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const userData = {
      ...rawUserData,
      ...(rawUserData.password
        ? { password: await bcrypt.hash(rawUserData.password, 10) }
        : {}),
    };

    const hasProfileUpdate = [firstName, lastName, phone, avatarUrl].some(
      (value) => value !== undefined,
    );

    if (hasProfileUpdate) {
      await this.prisma.profile.upsert({
        where: { userId: id },
        update: {
          firstName,
          lastName,
          phone,
          avatarUrl,
        },
        create: {
          userId: id,
          firstName,
          lastName,
          phone,
          avatarUrl,
        },
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
      include: {
        profile: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async updateProfilePicture(userId: string, avatarUrl: string) {
    await this.ensureUserExists(userId);

    return this.prisma.profile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: {
        userId,
        avatarUrl,
      },
    });
  }

  async remove(id: string) {
    await this.ensureUserExists(id);
    const deletedUser = await this.prisma.user.delete({ where: { id } });

    return {
      message: 'User deleted successfully',
      user: this.sanitizeUser(deletedUser),
    };
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
