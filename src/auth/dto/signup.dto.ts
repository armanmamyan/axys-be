import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class SignupDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  referral?: string
}
