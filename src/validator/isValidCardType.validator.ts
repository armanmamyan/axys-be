import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
import { CardCategory, NftCardType, PremiumCardType, StandardCardType } from 'src/card-orders/enums';
  
  @ValidatorConstraint({ name: 'IsValidCardType', async: false })
  export class IsValidCardTypeConstraint implements ValidatorConstraintInterface {
    validate(cardType: any, args: ValidationArguments) {
      const object: any = args.object;
      const cardCategory: CardCategory = object.cardCategory;
  
      switch (cardCategory) {
        case CardCategory.STANDARD:
          return Object.values(StandardCardType).includes(cardType);
        case CardCategory.PREMIUM:
          return Object.values(PremiumCardType).includes(cardType);
        case CardCategory.NFT:
          return Object.values(NftCardType).includes(cardType);
        default:
          return false;
      }
    }
  
    defaultMessage(args: ValidationArguments) {
      return 'Invalid card type for the selected card category.';
    }
  }
  
  export function IsValidCardType(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'IsValidCardType',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: IsValidCardTypeConstraint,
      });
    };
  }
  