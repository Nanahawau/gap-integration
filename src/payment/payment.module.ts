import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeAPIMockService } from 'src/integrations/payment-providers/stripeapi-mock.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: StripeAPIMockService,
    },
  ],
})
export class PaymentModule {}
