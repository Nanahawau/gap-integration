import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';


describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      processWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = {
        payment_id: '123',
        amount: 100,
        currency: 'USD',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
      };
      const result = { ...dto, status: 'processing' };
      (service.create as jest.Mock).mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return result', async () => {
      const result = {
        payment_id: '123',
        amount: '100',
        currency: 'USD',
        sender: 'mike@gmail.com',
        receiver: 'nick@gmail.com',
        status: 'success',
      };
      (service.findOne as jest.Mock).mockResolvedValue(result);

      expect(await controller.findOne('123')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('processWebhook', () => {
    it('should call service.processWebhook and return result', async () => {
      const dto = { payment_id: '123', status: 'success' };
      const result = { payment_id: '123', status: 'success' };
      (service.processWebhook as jest.Mock).mockResolvedValue(result);

      expect(await controller.processWebhook(dto)).toEqual(result);
      expect(service.processWebhook).toHaveBeenCalledWith(dto);
    });
  });
});
