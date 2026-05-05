import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
