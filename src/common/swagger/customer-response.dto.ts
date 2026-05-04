import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileResponseDto } from './user-response.dto';

export class CustomerOrderCountDto {
  @ApiProperty({ example: 2 })
  orders: number;
}

export class CustomerMeResponseDto {
  @ApiProperty({ example: '0a7c8f8e-6d50-4f2a-8af3-5ce6fefdf7cc' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'CUSTOMER', enum: ['GUEST', 'CUSTOMER', 'VENDOR', 'ADMIN'] })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => ProfileResponseDto })
  profile?: ProfileResponseDto | null;

  @ApiProperty({ type: () => CustomerOrderCountDto })
  _count: CustomerOrderCountDto;
}

export class CustomerCartItemProductDto {
  @ApiProperty({ example: 'c62d90b0-b1b9-4c3c-bc8b-2d0f42b0bf9c' })
  id: string;

  @ApiProperty({ example: 'Sneakers' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/product.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ example: 10 })
  stock: number;
}

export class CustomerCartItemDto {
  @ApiProperty({ example: '8adbe9f8-3270-4b0b-89b4-1d3ed2dbad9b' })
  id: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ type: () => CustomerCartItemProductDto })
  product: CustomerCartItemProductDto;
}

export class CustomerCartResponseDto {
  @ApiPropertyOptional({ example: '7ed0e5a5-0c22-4d79-9a25-32b19fb9e2bb' })
  id?: string;

  @ApiPropertyOptional({ type: () => [CustomerCartItemDto] })
  items?: CustomerCartItemDto[];

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiProperty({ example: 199.98 })
  totalAmount: number;

  @ApiPropertyOptional({ example: '2026-04-29T12:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-04-29T12:00:00.000Z' })
  updatedAt?: Date;
}

export class CustomerOrderItemProductDto {
  @ApiProperty({ example: 'a7c19d1b-3a14-4d6c-9f1b-1fdc1c3a4e60' })
  id: string;

  @ApiProperty({ example: 'Sneakers' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/product.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] })
  status: string;
}

export class CustomerOrderItemDto {
  @ApiProperty({ example: '2eb27161-3a59-4b86-9fbb-5f0842af1111' })
  id: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 99.99 })
  unitPrice: number;

  @ApiProperty({ type: () => CustomerOrderItemProductDto })
  product: CustomerOrderItemProductDto;
}

export class CustomerOrderResponseDto {
  @ApiProperty({ example: 'f8ae1a45-49da-4f37-9728-1b9c47c4aee1' })
  id: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ example: 199.98 })
  totalAmount: number;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: () => [CustomerOrderItemDto] })
  items: CustomerOrderItemDto[];
}
