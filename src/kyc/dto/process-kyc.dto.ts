import { IsBoolean, IsOptional, IsJSON, IsDateString, IsString } from 'class-validator';

export class ProcessKycDto {
  @IsString()
  userId: string;

  @IsBoolean()
  basicPoaKycLevel: boolean;

  @IsOptional()
  @IsJSON()
  basicPoaDetails?: any;

  @IsDateString()
  date: Date;
}
