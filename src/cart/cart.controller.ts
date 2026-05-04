import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('cart')
@ApiTags('Cart')
@ApiBearerAuth('access-token')
export class CartController {}
