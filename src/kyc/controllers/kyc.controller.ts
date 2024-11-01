import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategy/jwt-auth.guard';
import { GetUser } from '@/users/decorators/get-user.decorator';
import { KycService } from '../services/kyc.service';
import { KYC } from '../entities/kyc.entity';
import { CreateKycDto } from '../dto/create-kyc.dto';
import { User } from '@/users/entities/user.entity';
import { UpdateKycDto } from '../dto/update-kyc.dto';


@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiTags('KYC')
@ApiSecurity('JWT-auth')
export class KycController {
	constructor(private readonly kycService: KycService) {}

  @Post()
  async create(@Body() createKyc: CreateKycDto, @GetUser() user: User): Promise<KYC> {
    return this.kycService.create({...createKyc, userId: user.id.toString()});
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

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.kycService.delete(id);
  }
 
}
