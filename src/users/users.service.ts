import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StripeService } from '@/third-parties/stripe/stripe.service';
import { OrdersService } from '@/card-orders/services/card-orders.service';
import { OrderStatus } from '@/card-orders/enums';
import { KycStatus } from '@/kyc/enums';

import { FireblocksService } from '@/third-parties/fireblocks/fireblocks.service';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private cardOrderService: OrdersService,
    private stripeService: StripeService,
    private fireblocksService: FireblocksService
  ) {}

  async create(createUser: Partial<User>) {
    const processUserCreation = await this.usersRepository.save(new User(createUser));

    return {
      user: processUserCreation,
    };
  }

  async createFireblocksAccountForUser(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    const { fireblocksId } = await this.fireblocksService.createFireblocksAccountWithAssets(
      id,
      user.email
    );

    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ fireblocksVaultId: fireblocksId })
      .where({
        id,
      })
      .returning('*')
      .execute();
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findUserByFireblocksId(id: string) {
    return await this.usersRepository.findOne({
      where: { fireblocksVaultId: id },
    });
  }

  async findUser(email: string) {
    const userData = await this.usersRepository.findOne({
      where: { email },
      select: [
        'avatar',
        'email',
        'id',
        'kycStatus',
        'name',
        'surName',
        'username',
        'onBoarding',
        'cardOrder',
        'cards',
        'stripeCustomerId',
        'fireblocksVaultId',
        'shortId',
      ],
      relations: ['cardOrder', 'kyc'],
    });
    if (!userData) return null;
    const getAssetList = await this.fireblocksService.getVaultAccountDetails(
      userData?.fireblocksVaultId
    );

    return {
      ...userData,
      assets: getAssetList?.data?.assets,
    };
  }

  async findByStripeCustomerId(customer: string): Promise<Partial<User>> {
    return await this.usersRepository.findOne({
      where: { stripeCustomerId: customer },
      select: [
        'avatar',
        'email',
        'id',
        'kycStatus',
        'name',
        'surName',
        'username',
        'onBoarding',
        'cardOrder',
        'cards',
        'stripeCustomerId',
      ],
      relations: ['cardOrder', 'kyc'],
    });
  }

  // Get all user information
  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['cardOrder', 'kyc'],
    });
  }

  async updateData(userEmail, data) {
    return await this.usersRepository.update({ email: userEmail }, data);
  }

  async validateStripeAccount(user: User) {
    const customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripeService.createStripeCustomer(user.email);
      await this.usersRepository.update({ id: user.id }, { stripeCustomerId: customer.id });
      const createIntent = await this.stripeService.createSetupIntent(customer.id);
      return {
        validationId: createIntent.client_secret,
      };
    }
    // Expiration Process:
    // If a user initiates a SetupIntent or PaymentIntent but doesn't complete it (e.g., closes the browser),
    // the intent stays in a pending state like requires_confirmation or requires_action.
    // After 24 hours of inactivity, Stripe automatically expires the intent by setting its status to canceled.
    // Implications:

    // If the user returns within 24 hours, you can attempt to reuse the existing intent by retrieving it from
    //  Stripe and checking its status.
    // However, reusing intents can be complex due to potential state changes or partial completions.
    const createIntent = await this.stripeService.createSetupIntent(customerId);

    return {
      validationId: createIntent.client_secret,
    };
  }

  async createSubscription(user: User, paymentMethodId: string, priceId: string): Promise<any> {
    const customerId = user.stripeCustomerId;

    // Attach the payment method
    await this.stripeService.attachPaymentMethod(customerId, paymentMethodId);

    // Create the subscription
    const subscription = await this.stripeService.createSubscription(customerId, priceId);

    await this.usersRepository.update({ id: user.id }, { subscriptionId: subscription.id });

    return subscription;
  }

  async processPayment(
    user: User,
    paymentMethodId: string,
    priceId: string,
    orderId: string
  ): Promise<any> {
    const customerId = user.stripeCustomerId;
    const order = await this.cardOrderService.getOrderById(Number(orderId));

    if (order.status === OrderStatus.PENDING) {
      // Attach the payment method
      await this.stripeService.attachPaymentMethod(customerId, paymentMethodId);

      // Create the payment manually
      const manualPayment = await this.stripeService.processPayment(customerId, priceId, orderId);

      await this.usersRepository.update({ id: user.id }, { subscriptionId: manualPayment.id });

      return manualPayment;
    }

    return order;
  }

  async updateKycStatus(userId: string, status: KycStatus): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: Number(userId) },
        select: [
          'avatar',
          'email',
          'id',
          'kycStatus',
          'name',
          'surName',
          'username',
          'onBoarding',
          'cardOrder',
          'cards',
          'stripeCustomerId',
        ],
        relations: ['cardOrder', 'kyc'],
      });

      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      // Perform the status update
      await this.usersRepository.update(
        { id: Number(userId) },
        {
          kycStatus: status,
        }
      );

      // Return updated user data
      const updatedUser = await this.usersRepository.findOne({
        where: { id: Number(userId) },
        select: [
          'avatar',
          'email',
          'id',
          'kycStatus',
          'name',
          'surName',
          'username',
          'onBoarding',
          'cardOrder',
          'cards',
          'stripeCustomerId',
        ],
        relations: ['cardOrder', 'kyc'],
      });

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user data');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }
}
