import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentProviderInterface } from './payment-provider.interface';
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  QueryPaymentStatusResponse,
} from './payment-provider.type';
import { PaymentStatus } from 'src/payment/types/payment.type';
import axios from 'axios';
import defaultConfig from 'config/default.config';
import { ConfigService, ConfigType } from '@nestjs/config';

@Injectable()
export class StripeAPIMockService implements PaymentProviderInterface {
    constructor(@Inject(defaultConfig.KEY) private configService: ConfigType<typeof defaultConfig>){}
  private readonly logger = new Logger(StripeAPIMockService.name);
  async create(
    createPaymentRequest: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate webhook call after 1 second
    setTimeout(() => {
      const { payment_id } = createPaymentRequest;
      const status = payment_id.includes('fail')
        ? PaymentStatus.FAILED
        : PaymentStatus.SUCCESS;
      axios
        .post(
          'http://localhost:3000/payments/provider/webhook',
          {
            payment_id,
            status,
          },
          {
            headers: {
              'x-authentication': this.configService.authenticationKey
            },
          },
        )
        .catch((error) => {
          // Handle error silently for simulation
          this.logger.error({
            message: 'An error occurred while triggering webhook',
            error,
          });
        });
    }, 60000);

    // Return a mock response
    return {
      payment_id: createPaymentRequest.payment_id,
      status: PaymentStatus.PROCESSING,
      amount: createPaymentRequest.amount,
      currency: createPaymentRequest.currency,
    };
  }

  async queryStatus(paymentId: string): Promise<QueryPaymentStatusResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Return 'failed' if paymentId contains 'fail', otherwise 'success'
    const status = paymentId.includes('fail')
      ? PaymentStatus.FAILED
      : PaymentStatus.SUCCESS;
    return {
      payment_id: paymentId,
      status,
    };
  }
}
