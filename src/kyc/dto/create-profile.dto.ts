import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Gender } from '../enums';

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  callingCode: string;

  @IsString()
  @IsNotEmpty()
  countryCallingCode: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  optional?: string;

  validate() {
    if (this.country === 'US' && !this.state) {
      throw new Error('State is required for US addresses');
    }
  }
}

export class ProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsNumber()
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @IsNotEmpty()
  placeOfBirth: string;

  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
