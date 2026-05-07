import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerService } from './customer.service';
import {
  CustomerCartResponseDto,
  CustomerMeResponseDto,
  CustomerOrderResponseDto,
} from '../common/swagger/customer-response.dto';
import { ProfileResponseDto } from '../common/swagger/user-response.dto';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';

@Controller('customer')
@Roles(Role.CUSTOMER)
@ApiTags('Customer')
@ApiBearerAuth('access-token')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CustomerMeResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMe(@CurrentUser('sub') userId: string) {
    return this.customerService.getMe(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerService.updateProfile(userId, dto);
  }

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [CustomerOrderResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getOrders(@CurrentUser('sub') userId: string) {
    return this.customerService.getOrders(userId);
  }

  @Get('orders/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CustomerOrderResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getOrderById(
    @CurrentUser('sub') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.customerService.getOrderById(userId, orderId);
  }

  @Get('cart')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CustomerCartResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getCart(@CurrentUser('sub') userId: string) {
    return this.customerService.getCart(userId);
  }

  @Patch('deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer account deactivated successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  deactivateAccount(@CurrentUser('sub') userId: string) {
    return this.customerService.deactivateAccount(userId);
  }
}
