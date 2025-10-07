import {
  IsEmail,
  IsInt,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// List of valid ISO 4217 currency codes (sample)
const ISO_4217_CODES = ['USD', 'EUR', 'GBP', 'NGN'];

@ValidatorConstraint({ name: 'isCurrencyCode', async: false })
export class IsCurrencyCodeConstraint implements ValidatorConstraintInterface {
  validate(code: string, args: ValidationArguments) {
    return (!!code && ISO_4217_CODES.includes(code.toUpperCase()));
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid ISO 4217 currency code`;
  }
}

export class CreatePaymentDto {
  @IsString()
  payment_id: string;
  @IsInt()
  amount: number;
  @IsString()
  @Validate(IsCurrencyCodeConstraint)
  currency: string;
  @IsEmail()
  sender: string;
  @IsEmail()
  receiver: string;
}
