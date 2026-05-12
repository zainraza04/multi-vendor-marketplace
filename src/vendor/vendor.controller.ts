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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ProfileResponseDto } from '../common/swagger/user-response.dto';
import { StoreResponseDto } from '../common/swagger/store-response.dto';
import { PaginatedStoreResponseDto } from '../common/swagger/pagination-response.dto';
import { VendorMeResponseDto } from '../common/swagger/vendor-response.dto';
import { CreateStoreDto } from '../store/dto/create-store.dto';
import { UpdateStoreDto } from '../store/dto/update-store.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { VendorService } from './vendor.service';

@Controller('vendor')
@Roles(Role.VENDOR)
@ApiTags('Vendor')
@ApiBearerAuth('access-token')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VendorMeResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMe(@CurrentUser('sub') userId: string) {
    return this.vendorService.getMe(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.vendorService.updateProfile(userId, dto);
  }

  @Get('stores')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedStoreResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getStores(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.vendorService.getStores(userId, query);
  }

  @Get('stores/:storeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getStoreById(
    @CurrentUser('sub') userId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
  ) {
    return this.vendorService.getStoreById(userId, storeId);
  }

  @Post('stores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  createStore(@CurrentUser('sub') userId: string, @Body() dto: CreateStoreDto) {
    return this.vendorService.createStore(userId, dto);
  }

  @Patch('stores/:storeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateStore(
    @CurrentUser('sub') userId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.vendorService.updateStore(userId, storeId, dto);
  }

  @Delete('stores/:storeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Store deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  removeStore(
    @CurrentUser('sub') userId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
  ) {
    return this.vendorService.deleteStore(userId, storeId);
  }

  @Patch('deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Vendor account deactivated successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  deactivateAccount(@CurrentUser('sub') userId: string) {
    return this.vendorService.deactivateAccount(userId);
  }
}
