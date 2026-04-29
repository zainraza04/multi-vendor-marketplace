import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: jest.Mocked<CustomerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            getMe: jest.fn(),
            updateProfile: jest.fn(),
            getOrders: jest.fn(),
            getOrderById: jest.fn(),
            getCart: jest.fn(),
            deactivateAccount: jest.fn(),
            updateProfilePicture: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get(CustomerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current customer data', async () => {
    service.getMe.mockResolvedValueOnce({ id: 'customer-id' } as never);

    const result = await controller.getMe('customer-id');

    expect(service.getMe).toHaveBeenCalledWith('customer-id');
    expect(result).toEqual({ id: 'customer-id' });
  });

  it('should update customer profile', async () => {
    const payload = { firstName: 'Zain' };
    service.updateProfile.mockResolvedValueOnce({
      id: 'profile-id',
      ...payload,
    } as never);

    const result = await controller.updateProfile('customer-id', payload);

    expect(service.updateProfile).toHaveBeenCalledWith('customer-id', payload);
    expect(result).toEqual({ id: 'profile-id', ...payload });
  });
});
