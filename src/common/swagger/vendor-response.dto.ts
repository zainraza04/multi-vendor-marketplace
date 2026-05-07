import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileResponseDto } from './user-response.dto';

export class VendorStoreCountDto {
  @ApiProperty({ example: 2 })
  stores: number;
}

export class VendorMeResponseDto {
  @ApiProperty({ example: '0a7c8f8e-6d50-4f2a-8af3-5ce6fefdf7cc' })
  id: string;

  @ApiProperty({ example: 'vendor@example.com' })
  email: string;

  @ApiProperty({
    example: 'VENDOR',
    enum: ['GUEST', 'CUSTOMER', 'VENDOR', 'ADMIN'],
  })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-05T10:12:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => ProfileResponseDto })
  profile?: ProfileResponseDto | null;

  @ApiProperty({ type: () => VendorStoreCountDto })
  _count: VendorStoreCountDto;
}
