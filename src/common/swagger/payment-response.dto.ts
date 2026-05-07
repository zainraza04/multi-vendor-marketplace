import { ApiProperty } from '@nestjs/swagger';

export class PaymentCheckoutResponseDto {
  @ApiProperty({ example: 'f8ae1a45-49da-4f37-9728-1b9c47c4aee1' })
  orderId: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_123' })
  checkoutUrl: string;

  @ApiProperty({ example: 'cs_test_123' })
  sessionId: string;
}
