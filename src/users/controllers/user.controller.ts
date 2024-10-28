// Cores
import {
  Body,
  Controller,
  BadRequestException,
  Get,
  Post,
  Query,
  Param,
  UnauthorizedException,
  Logger,
  Req,
  Headers,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../entities/user.entity';

// Services
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from '../users.service';
import { hashSync } from 'bcryptjs';
import Stripe from 'stripe';
import { StripeService } from '@/third-parties/stripe/stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('user')
@ApiTags('User')
export class UserController {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private mailerService: MailerService,
    private stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post('/signup')
  async createUser(@Body() user: Partial<User>): Promise<Partial<User>> {
    try {
      const { email, password, referral } = user;
      // Check if there is a user.
      if (!user.email) {
        throw new BadRequestException(`You must define a user.`);
      }

      // Check if the wallet already exists within the database.
      const existingUser = await this.userService.findUser(user.email);
      const theJWTToken = await this.authService.generateToken(user.email);

      if (!existingUser) {
        const createUser = {
          email,
          username: email,
          password: hashSync(password, 10),
          referral: referral || 'none',
          token: theJWTToken,
        };
        const storeUser = await this.userService.create(createUser);
        const { id, kycStatus, name, avatar, username, surName } = storeUser;

        // Send Welcome via email
        await this.mailerService.sendMail({
          to: email,
          subject: 'Welcome to AXYS - Your digital bank is here',
          template: 'welcome',
        });
        return {
          id,
          email,
          token: theJWTToken,
          kycStatus,
          name,
          avatar,
          username,
          surName,
        };
      }
      throw new UnauthorizedException('User Already Exists');
    } catch (error) {
      this.logger.debug(error.message);
      throw new UnauthorizedException(error?.message || 'Something Went Wrong');
    }
  }

  @Get('validate-token')
  async checkTokenExpiration(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return await this.authService.validateUserToken(token);
  }

  @Post('/stripe/webhook')
  async handleWebhook(
    @Req() req,
    @Headers('stripe-signature') signature: string,
  ) {
     let event;
      
    try {
      event = this.stripeService.constructEventFromWebhook(
        req?.rawBody,
        signature,
      );
    } catch (err) {
      throw new BadRequestException(`⚠️  Error verifying webhook signature: ${err.message}`);
    }
    console.log(event.type);
    
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;
      case 'customer.subscription.paused':
        await this.handleSubscriptionPaused(event);
        break;
      case 'customer.subscription.resumed':
        await this.handleSubscriptionResumed(event);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event);
        break;
      case 'invoice.payment_succeeded':
      // case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event);
        break;
      case 'invoice.upcoming':
        await this.handleInvoiceUpcoming(event);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true }
  }

  private async handlePaymentSucceeded(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    
    const user = await this.userService.findByStripeCustomerId(customerId);
    if (user) {
      this.eventEmitter.emit('payment.created', invoice, user.email);
    } else {
      console.error(`User not found for customerId: ${customerId}`);
    }
  }

  private async handlePaymentFailed(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    const user = await this.userService.findByStripeCustomerId(customerId);
    if (user) {
      // Notify the user about the failed payment
      this.eventEmitter.emit('payment.rejected', invoice, user.email);
    } else {
      console.error(`User not found for customerId: ${customerId}`);
    }
  }

  private async handleSubscriptionResumed(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    // Update your database to mark the subscription as active
    // subscription.customer as string,
    // 'active',
  }

  private async handleSubscriptionPaused(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    // Update your database to mark the subscription as paused
    // subscription.customer as string,
    // 'paused',
  }

  private async handleSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    // Update your database to mark the user as unsubscribed
    //   subscription.customer as string,
    //   'canceled',
  }

  private async handleInvoiceUpcoming(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    // Optionally notify the user about the upcoming invoice
    // invoice.customer as string,
    // invoice.amount_due,
    // invoice.due_date,
  }
  
}
