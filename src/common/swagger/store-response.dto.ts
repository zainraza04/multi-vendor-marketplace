import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreResponseDto {
  @ApiProperty({ example: '9f7e7c3e-7f13-4bb7-9072-7df6b1b2c1cd' })
  id: string;

  @ApiProperty({ example: 'Urban Kicks' })
  name: string;

  @ApiPropertyOptional({ example: 'Streetwear and sneaker essentials.' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/store-logo.png' })
  logoUrl?: string | null;

  @ApiProperty({ example: false })
  isVerified: boolean;

  @ApiProperty({ example: 'c2a3d2d9-4b59-4a24-b2d7-33a5d79d3a33' })
  ownerId: string;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  updatedAt: Date;
}
