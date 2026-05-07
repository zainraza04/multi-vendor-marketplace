import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemStoreDto {
  @ApiProperty({ example: '7e5a1dd0-3d8f-4706-9b2b-4c4d6c4b6f84' })
  id: string;

  @ApiProperty({ example: 'Urban Kicks' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logoUrl?: string | null;
}

export class CartItemProductDto {
  @ApiProperty({ example: 'f4db1b8f-5f1a-4cd3-9bf6-3f0d401ffdb5' })
  id: string;

  @ApiProperty({ example: 'Running Shoes' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/product.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 149.99 })
  price: number;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ example: 12 })
  stock: number;

  @ApiProperty({ type: () => CartItemStoreDto })
  store: CartItemStoreDto;
}

export class CartItemDto {
  @ApiProperty({ example: '2eb27161-3a59-4b86-9fbb-5f0842af1111' })
  id: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ type: () => CartItemProductDto })
  product: CartItemProductDto;
}

export class CartResponseDto {
  @ApiPropertyOptional({ example: 'd2ce7c7b-0b40-4c25-8c6c-5d4040a7a3dd' })
  id?: string;

  @ApiPropertyOptional({ example: '0a7c8f8e-6d50-4f2a-8af3-5ce6fefdf7cc' })
  customerId?: string;

  @ApiProperty({ type: () => [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiProperty({ example: 299.98 })
  totalAmount: number;

  @ApiPropertyOptional({ example: '2026-05-05T10:12:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-05-05T10:12:00.000Z' })
  updatedAt?: Date;
}
