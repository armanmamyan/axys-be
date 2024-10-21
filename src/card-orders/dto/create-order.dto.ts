// src/dtos/create-order.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ValidateIf,
  Length,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardCategory, PaymentType, PaymentPlan } from '../enums';
import { IsValidCardType } from 'src/validator/isValidCardType.validator';

class DeliveryAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  optional: string;
}

class PaymentDetailsDto {
  @ValidateIf((o) => o.paymentType === PaymentType.CREDIT_CARD)
  @IsString()
  @Length(4, 4)
  last4Digits: string;

  @ValidateIf((o) => o.paymentType === PaymentType.CRYPTO)
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

class PaymentReceiptDto {
  @ValidateIf((o) => o.paymentType === PaymentType.CRYPTO)
  @IsString()
  @IsNotEmpty()
  to: string;

  @ValidateIf((o) => o.paymentType === PaymentType.CRYPTO)
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @ValidateIf((o) => o.paymentType === PaymentType.CREDIT_CARD)
  @IsString()
  @IsNotEmpty()
  paymentPriceId: string;
}

export class CreateOrderDto {
  @IsEnum(CardCategory)
  cardCategory: CardCategory;

  @IsString()
  @IsNotEmpty()
  @IsValidCardType({
    message: 'Invalid card type for the selected card category.',
  })
  cardType: string;

  @IsEnum(PaymentPlan)
  paymentPlan: PaymentPlan;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;

  @ValidateNested()
  @Type(() => PaymentReceiptDto)
  paymentReceipt: PaymentReceiptDto;

  @IsOptional()
  consumedNfts: any;

  @IsOptional()
  designNft: any;
}
