import { IsBoolean, IsOptional, IsJSON, IsDateString } from 'class-validator';

export class CreateKycDto {
  @IsBoolean()
  basicPoaKycLevel: boolean;

  @IsOptional()
  @IsJSON()
  basicPoaDetails?: any;

  @IsDateString()
  date: Date;
}
