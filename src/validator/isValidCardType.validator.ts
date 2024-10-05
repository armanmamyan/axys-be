import { CardCategory, NftCardType, PremiumCardType, StandardCardType } from "@/card-orders/enums";
import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsValidCardType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidCardType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const cardCategory = (args.object as any).cardCategory;
          switch (cardCategory) {
            case CardCategory.STANDARD:
              return Object.values(StandardCardType).includes(value);
            case CardCategory.PREMIUM:
              return Object.values(PremiumCardType).includes(value);
            case CardCategory.NFT:
              return Object.values(NftCardType).includes(value);
            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid card type for the selected card category.';
        },
      },
    });
  };
}
