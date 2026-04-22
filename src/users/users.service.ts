import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeUser(user: User) {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findMe(userId: string) {
    return this.findOne(userId);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.ensureUserExists(id);

    if (updateUserDto.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const data = {
      ...updateUserDto,
      ...(updateUserDto.password
        ? { password: await bcrypt.hash(updateUserDto.password, 10) }
        : {}),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.sanitizeUser(updatedUser);
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
