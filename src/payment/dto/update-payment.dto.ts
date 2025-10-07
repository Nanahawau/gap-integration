import { IsEnum, IsString } from 'class-validator';
import { PaymentStatus } from '../types/payment.type';

export class UpdatePaymentDto {
  @IsString()
  payment_id: string;
  @IsEnum(PaymentStatus, {
    message: 'status must be a valid PaymentStatus value',
  })
  status: string;
}
