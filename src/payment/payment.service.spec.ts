import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentProviderInterface } from 'src/integrations/payment-providers/payment-provider.interface';
import { BadRequestException } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: Repository<Payment>;
  let paymentProvider: PaymentProviderInterface;

  beforeEach(async () => {
    const mockRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    const mockProvider = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: mockRepo },
        { provide: 'PAYMENT_PROVIDER', useValue: mockProvider },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    paymentProvider = module.get<PaymentProviderInterface>('PAYMENT_PROVIDER');
  });

  describe('create', () => {
    it('should throw BadRequestException if payment ID is not valid', async () => {
      jest.spyOn(service, 'isPaymentIdValid').mockResolvedValue(false);
      await expect(
        service.create({
          payment_id: '123',
          amount: '100',
          currency: 'USD',
          sender: 'A',
          receiver: 'B',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save payment and call provider', async () => {
      jest.spyOn(service, 'isPaymentIdValid').mockResolvedValue(true);
      paymentRepository.save = jest.fn().mockResolvedValue({
        status: 'processing',
        amount: '100',
        currency: 'USD',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
      paymentProvider.create = jest.fn().mockResolvedValue({});

      const result = await service.create({
        payment_id: '123',
        amount: '100',
        currency: 'USD',
        sender: 'A',
        receiver: 'B',
      } as any);
      expect(paymentRepository.save).toHaveBeenCalled();
      expect(paymentProvider.create).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'processing',
        amount: '100',
        currency: 'USD',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
    });
  });

  describe('findOne', () => {
    it('should throw BadRequestException if payment not found', async () => {
      paymentRepository.findOne = jest.fn().mockResolvedValue(undefined);
      await expect(service.findOne('notfound')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return payment details if found', async () => {
      paymentRepository.findOne = jest.fn().mockResolvedValue({
        status: 'success',
        amount: '200',
        currency: 'EUR',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
      const result = await service.findOne('someid');
      expect(result).toEqual({
        status: 'success',
        amount: '200',
        currency: 'EUR',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
    });
  });

  describe('processWebhook', () => {
    it('should throw BadRequestException if payment not found', async () => {
      paymentRepository.findOne = jest.fn().mockResolvedValue(undefined);
      await expect(
        service.processWebhook({
          payment_id: 'notfound',
          status: 'failed',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update payment status and return details', async () => {
      paymentRepository.findOne = jest.fn().mockResolvedValue({
        status: 'processing',
        amount: '300',
        currency: 'GBP',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
      paymentRepository.update = jest.fn().mockResolvedValue({});
      const result = await service.processWebhook({
        payment_id: 'abc',
        status: 'success',
      } as any);
      expect(paymentRepository.update).toHaveBeenCalledWith(
        { payment_id: 'abc' },
        { status: 'success' },
      );
      expect(result).toEqual({
        status: 'processing',
        amount: '300',
        currency: 'GBP',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      });
    });
  });

  describe('isPaymentIdValid', () => {
    it('should return true if payment does not exist', async () => {
      paymentRepository.findOne = jest.fn().mockResolvedValue(undefined);
      const result = await service.isPaymentIdValid('newid');
      expect(result).toBe(true);
    });

    it('should return false if payment exists', async () => {
      paymentRepository.findOne = jest
        .fn()
        .mockResolvedValue({ payment_id: 'exists' });
      const result = await service.isPaymentIdValid('exists');
      expect(result).toBe(false);
    });
  });

  describe('toDisplayAmount', () => {
    it('should convert string cents to dollars', () => {
      expect(service.toDisplayAmount('12345')).toBe(123.45);
    });

    it('should convert number cents to dollars', () => {
      expect(service.toDisplayAmount(6789)).toBe(67.89);
    });

    it('should return 0 for zero amount', () => {
      expect(service.toDisplayAmount('0')).toBe(0);
      expect(service.toDisplayAmount(0)).toBe(0);
    });

    it('should handle undefined or invalid input gracefully', () => {
      expect(service.toDisplayAmount(undefined as any)).toBe(0);
      expect(service.toDisplayAmount('')).toBe(0);
      expect(service.toDisplayAmount('notanumber')).toBeNaN();
    });
  });
});
