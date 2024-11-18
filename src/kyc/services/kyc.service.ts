import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KYC } from '../entities/kyc.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateKycDto } from '../dto/create-kyc.dto';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KYC)
    private kycRepository: Repository<KYC>
  ) {}

  async create(createData: CreateKycDto): Promise<KYC> {
    const kyc = this.kycRepository.create(createData);
    return this.kycRepository.save(kyc);
  }

  async findOne(id: number): Promise<KYC> {
    const kyc = await this.kycRepository.findOne({ where: { id } });
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
    return kyc;
  }

  async update(id: number, updateData: Partial<KYC>): Promise<KYC> {
    const existingKyc = await this.findOne(id);

    if (!existingKyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }

    const updatedKyc = {
      ...existingKyc,
      ...updateData,
      date: new Date(),
    };

    return this.kycRepository.save(updatedKyc);
  }

  async delete(id: number): Promise<void> {
    const result = await this.kycRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
  }

  async findByUserId(userId: string): Promise<KYC> {
    const kyc = await this.kycRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    return kyc;
  }

  async findUsersNeedingAdditionalKyc(): Promise<KYC[]> {
    return this.kycRepository
      .createQueryBuilder('kyc')
      .leftJoinAndSelect('kyc.user', 'user')
      .where('kyc.basicPoaKycLevel = :approved', { approved: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('kyc.additionalPoaKycLevel = :false', { false: false }).orWhere(
            'kyc.additionalPoaKycLevel IS NULL'
          );
        })
      )
      .getMany();
  }
}
