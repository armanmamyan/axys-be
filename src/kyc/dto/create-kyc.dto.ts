import { IsBoolean, IsOptional, IsJSON, IsDateString, IsString } from 'class-validator';

export class CreateKycDto {
  @IsBoolean()
  basicPoaKycLevel: boolean;

  @IsBoolean()
  additionalPoaKycLevel: boolean;

  @IsOptional()
  @IsJSON()
  basicPoaDetails?: any;

  @IsOptional()
  @IsJSON()
  additionalPoaDetails?: any;

  @IsDateString()
  date: Date;
}
