import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ example: 'b0c7d4e2-4a5d-4f67-b8ad-0b4b12e4d6f0' })
  id: string;

  @ApiPropertyOptional({ example: 'Zain' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Raza' })
  lastName?: string | null;

  @ApiPropertyOptional({ example: '+923001234567' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/uploads/avatars/avatar.jpg' })
  avatarUrl?: string | null;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  updatedAt: Date;
}

export class UserResponseDto {
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
}

export class DeleteUserResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}
