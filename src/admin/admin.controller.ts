import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';
import { UserResponseDto } from '../common/swagger/user-response.dto';
import { StoreResponseDto } from '../common/swagger/store-response.dto';
import { ProductResponseDto } from '../common/swagger/product-response.dto';
import { AdminSummaryResponseDto } from '../common/swagger/admin-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  PaginatedProductResponseDto,
  PaginatedStoreResponseDto,
  PaginatedUserResponseDto,
} from '../common/swagger/pagination-response.dto';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { VerifyStoreDto } from './dto/verify-store.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';

@Controller('admin')
@Roles(Role.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AdminSummaryResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getSummary() {
    return this.adminService.getSummary();
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedUserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateUserRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Patch('users/:userId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateUserStatus(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto.isActive);
  }

  @Get('stores')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedStoreResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getStores(@Query() query: PaginationQueryDto) {
    return this.adminService.listStores(query);
  }

  @Patch('stores/:storeId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  verifyStore(
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
    @Body() dto: VerifyStoreDto,
  ) {
    return this.adminService.verifyStore(storeId, dto.isVerified);
  }

  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedProductResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getProducts(@Query() query: PaginationQueryDto) {
    return this.adminService.listProducts(query);
  }

  @Patch('products/:productId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateProductStatus(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.adminService.updateProductStatus(productId, dto.status);
  }
}
