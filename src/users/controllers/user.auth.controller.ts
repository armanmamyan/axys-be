import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from 'src/auth/strategy/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { OrdersService } from 'src/card-orders/services/card-orders.service';
import { CreateOrderDto } from 'src/card-orders/dto/create-order.dto';
import { ApproveOrderDto } from 'src/card-orders/dto/approve-order.dto';
import { NeogardenNftService } from 'src/third-parties/neogarden-nft/neogarden-nft.service';
import { GetNftsByWalletDto } from '../dto/get-nfts-by-wallet.dto';
import { StripeInformation } from '../dto/stripe-information.dto';
import { ProfileDto } from '@/kyc/dto/create-profile.dto';
import { KYC } from '@/kyc/entities/kyc.entity';
import { KycStatus } from '@/kyc/enums';
import { KycService } from '@/kyc/services/kyc.service';
import { FireblocksService } from '@/third-parties/fireblocks/fireblocks.service';
import { IwithdrawalDetails, TransferType } from '@/third-parties/fireblocks/types';
import { CardOrderWithCryptoDto } from '../dto/card-order-crypto.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiTags('User Auth')
@ApiSecurity('JWT-auth')
export class UserAuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UsersService,
    private authService: AuthService,
    private ordersService: OrdersService,
    private kycService: KycService,
    private neogardenNftService: NeogardenNftService,
    private fireblocksService: FireblocksService
  ) {}

  @Post('/update-user')
  async updateUser(@Body() user: Partial<User>): Promise<Partial<User> | UnauthorizedException> {
    // Check if there is a user.
    if (!user) {
      throw new BadRequestException(`You must define a user.`);
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });
    const theJWTToken = await this.authService.generateToken(user.email);

    if (existingUser) {
      const newUser = await this.userRepository
        .createQueryBuilder()
        .update({ token: theJWTToken })
        .where({ email: existingUser.email })
        .returning('*')
        .execute();
      const userReturned = this.userService.findUser(newUser.raw[0]['email']);
      return userReturned;
    }
  }

  @Get()
  async getUserData(@GetUser() user: User) {
    return await this.userService.findUser(user.email);
  }

  @Post('/apply-card')
  async applyCard(@Body() body: CreateOrderDto, @GetUser() user: User) {
    const userId = user.id;
    return await this.ordersService.createOrder(userId, body);
  }

  @Post('/process-card-order-crypto')
  async processCardPaymentWithCrypto(@Body() body: CardOrderWithCryptoDto, @GetUser() user: User) {
    try {
      const orderDetails = await this.ordersService.getOrderById(Number(body.orderId));
      const {
        to: withdrawalAddress,
        from,
        price: amount,
        assetId,
      }: {
        to: string;
        from: string;
        price: string;
        assetId: string;
      } = orderDetails.paymentReceipt;

      const processPayment = await this.fireblocksService.processVaultAccountWithdraw(from, {
        withdrawalAddress,
        assetId,
        amount,
        type: TransferType.servicePayment,
      } as IwithdrawalDetails);

      if (processPayment?.id) {
        const order = await this.ordersService.approveOrder(Number(body.orderId), {
          transactionId: processPayment.id,
          created: processPayment.createdBy,
          amount: `$${processPayment.amountUSD}`,
          amountInNativeToken: processPayment.amount,
          quantity: 1,
          customer: user.id,
          hosted_invoice_url: '#',
        });

        return order;
      }
      throw new Error('Payment processing failed. No transaction ID returned.');
    } catch (error) {
      console.error('Error processing card payment with crypto:', error.message);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/update-card-order')
  async updateCardOrder(@Body() body: any) {
    return await this.ordersService.updateOrder(body);
  }

  @Post('/approve-apply-card')
  async approveApplyCard(@Body() body: ApproveOrderDto, @GetUser() user: User) {
    const { orderId, paymentReceipt } = body;
    const order = await this.ordersService.approveOrder(orderId, paymentReceipt);

    return order;
  }

  @Post('/neogarden/nfts-by-wallet')
  async getNftsByWallet(@GetUser() user: User, @Body() getNftsByWalletDto: GetNftsByWalletDto) {
    const { walletAddress, pageNo, limit } = getNftsByWalletDto;
    try {
      const nfts = await this.neogardenNftService.getNftsByWallet(walletAddress, pageNo, limit);
      return nfts.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch NFTs: ${error.message}`);
    }
  }

  @Get('/stripe/validate-stripe')
  async validateStripeUserPais(@GetUser() user: User) {
    return await this.userService.validateStripeAccount(user);
  }

  @Get('/get-order-details')
  async getOrderDetails(@Query('id') id: string) {
    return await this.ordersService.getOrderById(Number(id));
  }

  @Post('/stripe/create-subscription')
  async processStripSubscription(
    @GetUser() user: User,
    @Body() stripeInformation: StripeInformation
  ) {
    const { paymentMethodId, priceId } = stripeInformation;
    const processSubscriptionCreation = await this.userService.createSubscription(
      user,
      paymentMethodId,
      priceId
    );
    return processSubscriptionCreation;
  }

  @Post('/stripe/process-payment')
  async processStripPayment(@GetUser() user: User, @Body() stripeInformation: StripeInformation) {
    const { paymentMethodId, priceId, orderId } = stripeInformation;
    const processSubscriptionCreation = await this.userService.processPayment(
      user,
      paymentMethodId,
      priceId,
      orderId
    );

    return processSubscriptionCreation;
  }

  @Post('/kyc/profile')
  async createProfile(@Body() profileDto: ProfileDto, @GetUser() user: User): Promise<KYC> {
    const kycData = {
      userId: user.id.toString(),
      basicPoaKycLevel: false,
      firstName: profileDto.firstName,
      lastName: profileDto.lastName,
      middleName: profileDto.middleName,
      gender: profileDto.gender,
      dob: profileDto.dob,
      contact: profileDto.contact,
      placeOfBirth: profileDto.placeOfBirth,
      address: profileDto.address,
      date: new Date(),
    };

    // FIXME: This should be removed after all before-mvp orders is shipped
    if (profileDto.address) {
      await this.ordersService.updateDeliveryAddress(user.id, profileDto.address);
    }

    return this.kycService.create(kycData);
  }

  @Patch('/kyc/applicantId/:id')
  async updateApplicantId(
    @Param('id', ParseIntPipe) id: number,
    @Body() applicantId: { applicantId: string }
  ): Promise<KYC> {
    const existingKyc = await this.kycService.findOne(id);
    if (!existingKyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }

    return this.kycService.update(id, applicantId);
  }

  @Patch('/kyc/:id')
  async updateKyc(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<KYC>): Promise<KYC> {
    const existingKyc = await this.kycService.findOne(id);
    if (!existingKyc) {
      throw new BadRequestException('KYC profile not found');
    }

    // FIXME: This should be removed after all before-mvp orders is shipped
    if (body.address) {
      await this.ordersService.updateDeliveryAddress(Number(existingKyc.userId), body.address);
    }

    return this.kycService.update(existingKyc.id, body);
  }

  @Get('/kyc/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KYC> {
    return this.kycService.findOne(id);
  }

  @Get('/kyc/profile/:userId')
  async getProfileByUserId(@Param('userId') userId: string): Promise<KYC> {
    const kyc = await this.kycService.findByUserId(userId);
    if (!kyc) {
      throw new BadRequestException('KYC profile not found');
    }
    return kyc;
  }

  @Delete('/kyc/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.kycService.delete(id);
  }
}
