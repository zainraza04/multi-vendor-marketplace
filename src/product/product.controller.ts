import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedProductResponseDto } from '../common/swagger/pagination-response.dto';
import { ProductResponseDto } from '../common/swagger/product-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
@ApiTags('Products')
@ApiBearerAuth('access-token')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedProductResponseDto })
  getProducts(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':productId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  getProductById(@Param('productId', new ParseUUIDPipe()) productId: string) {
    return this.productService.findOne(productId);
  }

  @Get('me/list')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedProductResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMyProducts(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.productService.findVendorProducts(userId, query);
  }

  @Post()
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  createProduct(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(userId, dto);
  }

  @Patch(':productId')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateProduct(
    @CurrentUser('sub') userId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(userId, productId, dto);
  }

  @Delete(':productId')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  removeProduct(
    @CurrentUser('sub') userId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.productService.remove(userId, productId);
  }
}
