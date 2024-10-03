import { IsString, IsNumber, Min } from "class-validator";

export class GetNftsByWalletDto {
  @IsString()
  walletAddress: string;

  @IsNumber()
  @Min(1)
  pageNo: number;

  @IsNumber()
  @Min(1)
  limit: number;
}
