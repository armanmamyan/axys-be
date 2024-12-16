import { IsString, IsNotEmpty } from "class-validator";

export class CardOrderWithCryptoDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
