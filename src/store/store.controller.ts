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
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedStoreResponseDto } from '../common/swagger/pagination-response.dto';
import { StoreResponseDto } from '../common/swagger/store-response.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreService } from './store.service';

@Controller('stores')
@ApiTags('Stores')
@ApiBearerAuth('access-token')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PaginatedStoreResponseDto })
  getStores(@Query() query: PaginationQueryDto) {
    return this.storeService.findAll(query);
  }

  @Get(':storeId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  getStoreById(@Param('storeId', new ParseUUIDPipe()) storeId: string) {
    return this.storeService.findOne(storeId);
  }

  @Post()
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  createStore(@CurrentUser('sub') userId: string, @Body() dto: CreateStoreDto) {
    return this.storeService.create(userId, dto);
  }

  @Patch(':storeId')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StoreResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateStore(
    @CurrentUser('sub') userId: string,
    @Param('storeId', new ParseUUIDPipe()) storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storeService.update(userId, storeId, dto);
  }

  @Delete(':storeId')
  @Roles(Role.VENDOR)
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
    return this.storeService.remove(userId, storeId);
  }
}
