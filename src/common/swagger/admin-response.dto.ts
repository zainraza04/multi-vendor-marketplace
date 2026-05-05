import { ApiProperty } from '@nestjs/swagger';

export class AdminSummaryResponseDto {
  @ApiProperty({ example: 120 })
  users: number;

  @ApiProperty({ example: 30 })
  vendors: number;

  @ApiProperty({ example: 80 })
  customers: number;

  @ApiProperty({ example: 10 })
  admins: number;

  @ApiProperty({ example: 15 })
  stores: number;

  @ApiProperty({ example: 230 })
  products: number;

  @ApiProperty({ example: 45 })
  orders: number;
}
