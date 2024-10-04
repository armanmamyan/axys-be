// src/transactions/dtos/create-transaction.dto.ts
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsEnum,
    ValidateNested,
    IsString,
    IsOptional,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { PaymentType, TransactionPurpose, TransactionStatus } from '../enums';
  
  class PaymentReceiptDto {
    @IsString()
    @IsNotEmpty()
    transactionId: string;
  
    @IsOptional()
    @IsString()
    paymentGateway?: string;
  
    // Additional fields as needed
  }
  
  export class CreateTransactionDto {
    @IsNotEmpty()
    to: string;
  
    @IsEnum(PaymentType)
    paymentType: PaymentType;
  
    @ValidateNested()
    @Type(() => PaymentReceiptDto)
    paymentReceipt: PaymentReceiptDto;
  
    @IsNumber()
    @IsPositive()
    amount: number;
  
    @IsEnum(TransactionPurpose)
    transactionPurpose: TransactionPurpose;

    @IsEnum(TransactionStatus)
    status: TransactionStatus
    
  }
  