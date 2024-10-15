import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApproveOrderDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNotEmpty()
  paymentReceipt: any;
}
