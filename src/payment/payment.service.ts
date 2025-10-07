import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentProviderInterface } from 'src/integrations/payment-providers/payment-provider.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @Inject('PAYMENT_PROVIDER')
    private readonly paymentProvider: PaymentProviderInterface,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createPaymentDto: CreatePaymentDto) {
    const { payment_id } = createPaymentDto;
    const lockKey = `lock:payment:${payment_id}`;

    // Check if lock exists first
    const existingLock = await this.cacheManager.get(lockKey);
    if (existingLock) {
      throw new BadRequestException('Payment is being processed. Please try again later.');
    }

    // Set the lock with TTL
    await this.cacheManager.set(lockKey, 'locked', 60000);

    const validPayment = await this.isPaymentIdValid(payment_id);

    if (!validPayment)
      throw new BadRequestException(
        'Payment ID must be unique, please generate a new one',
      );

    // Convert DTO to entity instance
    const payment = this.paymentRepository.create(createPaymentDto);
    const savedPayment = await this.paymentRepository.save(payment);

    // send payment request to provider.
    const paymentResponse = await this.paymentProvider.create(createPaymentDto);
    this.logger.log({ paymentId: payment_id, paymentResponse });

    return {
      status: savedPayment.status,
      amount: this.toDisplayAmount(savedPayment.amount),
      currency: savedPayment.currency,
      sender: savedPayment.sender,
      receiver: savedPayment.receiver,
    };
  }

  async findOne(id: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: {
        payment_id: id,
      },
    });

    if (!payment)
      throw new BadRequestException('No payment exists for this payment ID');

    return {
      status: payment.status,
      amount: this.toDisplayAmount(payment.amount),
      currency: payment.currency,
      sender: payment.sender,
      receiver: payment.receiver,
    };
  }

  async processWebhook(updatePaymentDto: UpdatePaymentDto) {
    const { payment_id } = updatePaymentDto;

    this.logger.log({ paymentId: payment_id, updatePaymentDto });

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        payment_id,
      },
    });

    if (!existingPayment)
      throw new BadRequestException(
        'No previous payment exists for this payment ID',
      );

    await this.paymentRepository.update(
      { payment_id },
      {
        status: updatePaymentDto.status,
      },
    );

    return {
      status: existingPayment.status,
      amount: this.toDisplayAmount(existingPayment.amount),
      currency: existingPayment.currency,
      sender: existingPayment.sender,
      receiver: existingPayment.receiver,
    };
  }

  async isPaymentIdValid(paymentId: string): Promise<boolean> {
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        payment_id: paymentId,
      },
    });

    return !existingPayment;
  }

  toDisplayAmount(amount: number | string): number {
    return Number(amount) / 100;
  }
}
