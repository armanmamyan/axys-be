import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
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
    private neogardenNftService: NeogardenNftService,
	) {}

  @Post('/update-user')
  async updateUser(@Body() user: Partial<User>): Promise<User | UnauthorizedException> {
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

  @Post('/update-card-order')
  async updateCardOrder(@Body() body: any) {
    return await this.ordersService.updateOrder(body);
  }

  @Post('/approve-apply-card')
  async approveApplyCard(@Body() body: ApproveOrderDto, @GetUser() user: User) {
    const { orderId, paymentReceipt } = body;
    const order = await this.ordersService.approveOrder(orderId, paymentReceipt);

    if (order.user.id !== user.id) {
      throw new BadRequestException('You are not authorized to approve this order');
    }

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
  async processStripSubscription(@GetUser() user: User, @Body() stripeInformation: StripeInformation) {
    const { paymentMethodId, priceId } = stripeInformation;
    const processSubscriptionCreation = await this.userService.createSubscription(user, paymentMethodId, priceId);
    return processSubscriptionCreation;
  }

  @Post('/stripe/process-payment')
  async processStripPayment(@GetUser() user: User, @Body() stripeInformation: StripeInformation) {
    const { paymentMethodId, priceId, orderId } = stripeInformation;
    const processSubscriptionCreation = await this.userService.processPayment(user, paymentMethodId, priceId, orderId);
    
    return processSubscriptionCreation;
  }

}
