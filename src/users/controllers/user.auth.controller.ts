import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { UpdateOrderStatusDto } from 'src/card-orders/dto/update-order.dto';
import { NeogardenNftService } from 'src/third-parties/neogarden-nft/neogarden-nft.service';
import { GetNftsByWalletDto } from '../dto/get-nfts-by-wallet.dto';
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
    private neogardenNftService: NeogardenNftService
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
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async applyCard(@Body() body: CreateOrderDto, @GetUser() user: User) {
		const userId = user.id;
		return await this.ordersService.createOrder(userId, body);
	}

	@Post('/update-card-order')
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async updateCardOrder(@Body() body: UpdateOrderStatusDto, @GetUser() user: User) {
		const userId = user.id;
		return await this.ordersService.updateOrderStatus(userId, body);
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

  // @Post('/verify/opensea')
  // async verifyOpenseaAccount(@GetUser() user: User, @Body() body: { address: string }): Promise<Wallet> {
  // 	return await this.userService.verifyOpenseaAccount(user.id, body?.address);
  // }

  // @Post('/verify/etherscan')
  // async verifyEtherscanAccount(
  // 	@GetUser() user: User,
  // 	@Body() body: { address: string; signature: any; message: string; id: string }
  // ): Promise<Wallet> {
  // 	return await this.userService.verifyEtherscanAccount(user.id, body);
  // }
}
