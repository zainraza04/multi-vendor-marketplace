import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'b3b0b00b-3a7a-4e3f-98c5-f6b7f99b05f4' })
  id: string;

  @ApiProperty({ example: 'Sneakers' })
  name: string;

  @ApiProperty({ example: 'sneakers' })
  slug: string;
}
