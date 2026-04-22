import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  providers: [UsersService, PrismaService, JwtAuthGuard],
  controllers: [UsersController]
})
export class UsersModule {}
