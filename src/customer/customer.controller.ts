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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
@Roles(Role.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@CurrentUser('sub') userId: string) {
    return this.customerService.getMe(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerService.updateProfile(userId, dto);
  }

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  getOrders(@CurrentUser('sub') userId: string) {
    return this.customerService.getOrders(userId);
  }

  @Get('orders/:orderId')
  @HttpCode(HttpStatus.OK)
  getOrderById(
    @CurrentUser('sub') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.customerService.getOrderById(userId, orderId);
  }

  @Get('cart')
  @HttpCode(HttpStatus.OK)
  getCart(@CurrentUser('sub') userId: string) {
    return this.customerService.getCart(userId);
  }

  @Patch('deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateAccount(@CurrentUser('sub') userId: string) {
    return this.customerService.deactivateAccount(userId);
  }
}
