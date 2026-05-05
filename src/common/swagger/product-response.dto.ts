import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductStoreDto {
  @ApiProperty({ example: '7e5a1dd0-3d8f-4706-9b2b-4c4d6c4b6f84' })
  id: string;

  @ApiProperty({ example: 'Urban Kicks' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logoUrl?: string | null;
}

export class ProductCategoryDto {
  @ApiProperty({ example: 'b3b0b00b-3a7a-4e3f-98c5-f6b7f99b05f4' })
  id: string;

  @ApiProperty({ example: 'Sneakers' })
  name: string;

  @ApiProperty({ example: 'sneakers' })
  slug: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'e5b7d3de-16d9-4c1b-b2b6-247dd4df5b9e' })
  id: string;

  @ApiProperty({ example: 'Running Shoes' })
  name: string;

  @ApiPropertyOptional({ example: 'Breathable running shoes.' })
  description?: string | null;

  @ApiProperty({ example: 149.99 })
  price: number;

  @ApiProperty({ example: 25 })
  stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/product.jpg' })
  imageUrl?: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ example: '7e5a1dd0-3d8f-4706-9b2b-4c4d6c4b6f84' })
  storeId: string;

  @ApiPropertyOptional({ example: 'b3b0b00b-3a7a-4e3f-98c5-f6b7f99b05f4' })
  categoryId?: string | null;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => ProductStoreDto })
  store?: ProductStoreDto;

  @ApiPropertyOptional({ type: () => ProductCategoryDto })
  category?: ProductCategoryDto | null;
}
