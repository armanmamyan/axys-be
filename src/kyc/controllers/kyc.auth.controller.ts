import { BadRequestException, Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
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
import { KycService } from '../services/kyc.service';
import { CreateKycDto } from '../dto/create-kyc.dto';
import { KYC } from '../entities/kyc.entity';
import { UpdateKycDto } from '../dto/update-kyc.dto';


@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiTags('KYC')
@ApiSecurity('JWT-auth')
export class KycController {
	constructor(private readonly kycService: KycService) {}

  @Post('/process')
  async create(@Body() createKyc: CreateKycDto, @GetUser() user: User): Promise<KYC> {
    return this.kycService.create(createKyc);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<KYC> {
    return this.kycService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKyc: UpdateKycDto,
  ): Promise<KYC> {
    return this.kycService.update(id, updateKyc);
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
