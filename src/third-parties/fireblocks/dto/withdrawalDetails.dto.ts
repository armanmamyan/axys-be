// src/dtos/create-order.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import { TransferType } from '../types';
import { IsNumberOrString } from '@/validator/isNumberOrString.validator';


export class WithdrawalDetailsDto {
  @IsEnum(TransferType)
  type: TransferType;

  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  withdrawalAddress: string;

  @Validate(IsNumberOrString)
  amount: string;
}
