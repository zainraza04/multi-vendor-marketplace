import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../dto/pagination.dto';
import { CategoryResponseDto } from './category-response.dto';
import { CustomerOrderResponseDto } from './customer-response.dto';
import { OrderResponseDto } from './order-response.dto';
import { ProductResponseDto } from './product-response.dto';
import { StoreResponseDto } from './store-response.dto';
import { UserResponseDto } from './user-response.dto';

export class PaginatedStoreResponseDto {
  @ApiProperty({ type: [StoreResponseDto] })
  data: StoreResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedCategoryResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedOrderResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedCustomerOrderResponseDto {
  @ApiProperty({ type: [CustomerOrderResponseDto] })
  data: CustomerOrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
