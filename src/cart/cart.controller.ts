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
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';
import { CartResponseDto } from 'src/common/swagger/cart-response.dto';

@Controller('cart')
@ApiTags('Cart')
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getCart(@CurrentUser('sub') customerId: string) {
    return this.cartService.getCart(customerId);
  }

  @Post('items')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: CartResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  addItem(@CurrentUser('sub') customerId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(customerId, dto);
  }

  @Patch('items/:productId')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateItem(
    @CurrentUser('sub') customerId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(customerId, productId, dto);
  }

  @Delete('items/:productId')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  removeItem(
    @CurrentUser('sub') customerId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.cartService.removeItem(customerId, productId);
  }

  @Delete('clear')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CartResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  clearCart(@CurrentUser('sub') customerId: string) {
    return this.cartService.clearCart(customerId);
  }
}
