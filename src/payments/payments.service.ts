import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly frontendUrl: string;
  private readonly currency: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2024-06-20',
    });

    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.currency = this.configService.get<string>('STRIPE_CURRENCY') || 'usd';
  }

  async createCheckoutSession(customerId: string) {
    const order = await this.orderService.checkout(customerId);

    try {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: this.currency,
            unit_amount: Math.round(Number(item.unitPrice) * 100),
            product_data: {
              name: item.product?.name ?? 'Marketplace item',
              images: item.product?.imageUrl ? [item.product.imageUrl] : [],
            },
          },
        }));

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${this.frontendUrl}/orders?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.frontendUrl}/cart?checkout=cancelled`,
        customer_email: order.customer?.email,
        client_reference_id: order.id,
        metadata: {
          orderId: order.id,
          customerId,
        },
        payment_intent_data: {
          metadata: {
            orderId: order.id,
            customerId,
          },
        },
      });

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: this.currency,
          status: PaymentStatus.PENDING,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      return {
        orderId: order.id,
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      await this.orderService.cancelOrderForPayment(order.id);
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Stripe checkout failed:', message);
      throw new InternalServerErrorException(
        'Unable to start checkout. Please try again.',
      );
    }
  }

  async handleWebhook(payload: Buffer, signature?: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature ?? '',
        webhookSecret,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Webhook error: ${message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'checkout.session.expired':
        await this.handleCheckoutExpired(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        break;
    }

    return { message: 'Webhook received' };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (!orderId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: PaymentStatus.PAID,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
      },
    });

    await this.orderService.confirmOrderForPayment(orderId);
  }

  private async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (!orderId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: PaymentStatus.EXPIRED },
    });

    await this.orderService.cancelOrderForPayment(orderId);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: PaymentStatus.FAILED },
    });

    await this.orderService.cancelOrderForPayment(orderId);
  }
}
