import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private STRIPE_WEBHOOK_SECRET;
  constructor(private configService: ConfigService) {
    this.STRIPE_WEBHOOK_SECRET = configService.get<string>('STRIPE_WEBHOOK_SECRET');
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET'));
  }

  async createStripeCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set it as the default payment method
    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async processPayment(
    customerId: string,
    priceId: string,
    orderId: string
  ): Promise<Stripe.Invoice> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);

      // Manually creating Invoice for payment
      await this.stripe.invoiceItems.create({
        customer: customerId,
        amount: price.unit_amount,
        currency: price.currency,
        description: price.nickname,
      });
      const createInvoice = await this.stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice',
        auto_advance: true,
        days_until_due: 1,
        pending_invoice_items_behavior: 'include',
        metadata: {
          orderId,
        },
      });

      return await this.stripe.invoices.pay(createInvoice.id);
    } catch (error) {
      throw error;
    }
  }

  async retrieveCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  async retrieveInvoice(invoiceId: string) {
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  constructEventFromWebhook(payload: any, signature: string) {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
