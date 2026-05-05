import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Body,
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
import { OrderResponseDto } from '../common/swagger/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@Controller('orders')
@ApiTags('Orders')
@ApiBearerAuth('access-token')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  checkout(@CurrentUser('sub') customerId: string) {
    return this.orderService.checkout(customerId);
  }

  @Get()
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [OrderResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMyOrders(@CurrentUser('sub') customerId: string) {
    return this.orderService.findCustomerOrders(customerId);
  }

  @Get(':orderId')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMyOrderById(
    @CurrentUser('sub') customerId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.findCustomerOrderById(customerId, orderId);
  }

  @Patch(':orderId/cancel')
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  cancelOrder(
    @CurrentUser('sub') customerId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.cancelOrder(customerId, orderId);
  }

  @Get('vendor')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [OrderResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getVendorOrders(@CurrentUser('sub') vendorId: string) {
    return this.orderService.findVendorOrders(vendorId);
  }

  @Patch('vendor/:orderId/ship')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  shipVendorOrder(
    @CurrentUser('sub') vendorId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.shipOrder(vendorId, orderId);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [OrderResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getAllOrders() {
    return this.orderService.listAllOrders();
  }

  @Patch('admin/:orderId/status')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateOrderStatus(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(orderId, dto.status);
  }
}
