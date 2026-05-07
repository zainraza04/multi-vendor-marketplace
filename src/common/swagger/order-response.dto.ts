import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderCustomerDto {
  @ApiProperty({ example: '0a7c8f8e-6d50-4f2a-8af3-5ce6fefdf7cc' })
  id: string;

  @ApiProperty({ example: 'customer@example.com' })
  email: string;
}

export class OrderItemProductDto {
  @ApiProperty({ example: 'f4db1b8f-5f1a-4cd3-9bf6-3f0d401ffdb5' })
  id: string;

  @ApiProperty({ example: 'Running Shoes' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/product.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 149.99 })
  price: number;
}

export class OrderItemStoreDto {
  @ApiProperty({ example: '7e5a1dd0-3d8f-4706-9b2b-4c4d6c4b6f84' })
  id: string;

  @ApiProperty({ example: 'Urban Kicks' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logoUrl?: string | null;
}

export class OrderItemDto {
  @ApiProperty({ example: '2eb27161-3a59-4b86-9fbb-5f0842af1111' })
  id: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 149.99 })
  unitPrice: number;

  @ApiProperty({ type: () => OrderItemProductDto })
  product: OrderItemProductDto;

  @ApiProperty({ type: () => OrderItemStoreDto })
  store: OrderItemStoreDto;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'f8ae1a45-49da-4f37-9728-1b9c47c4aee1' })
  id: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({ example: 199.98 })
  totalAmount: number;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: () => [OrderItemDto] })
  items: OrderItemDto[];

  @ApiPropertyOptional({ type: () => OrderCustomerDto })
  customer?: OrderCustomerDto;
}
