// src/cards/services/cards.service.ts
import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { KYC } from "../entities/kyc.entity";
import { Repository } from "typeorm";
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { ProcessKycDto } from "../dto/process-kyc.dto";


@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KYC)
    private kycRepository: Repository<KYC>,
  ) {}

  async create(createKyc: ProcessKycDto): Promise<KYC> {
    const kyc = this.kycRepository.create(createKyc);
    return this.kycRepository.save(kyc);
  }

  async findOne(id: number): Promise<KYC> {
    const kyc = await this.kycRepository.findOne({ where: { id } });
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
    return kyc;
  }

  async update(id: number, updateKycDto: UpdateKycDto): Promise<KYC> {
    await this.kycRepository.update(id, updateKycDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.kycRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
  }
  
}
