import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    profile: { upsert: jest.Mock };
    order: { findMany: jest.Mock; findFirst: jest.Mock };
    cart: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        upsert: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      cart: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upsert profile for existing customer', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'customer-1',
      isActive: true,
    });
    prisma.profile.upsert.mockResolvedValueOnce({
      id: 'profile-1',
      userId: 'customer-1',
      firstName: 'Zain',
    });

    const result = await service.updateProfile('customer-1', {
      firstName: 'Zain',
    });

    expect(prisma.profile.upsert).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'profile-1', firstName: 'Zain' });
  });

  it('should return cart totals when cart exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'customer-1',
      isActive: true,
    });
    prisma.cart.findUnique.mockResolvedValueOnce({
      id: 'cart-1',
      items: [
        { quantity: 2, product: { price: 15.5 } },
        { quantity: 1, product: { price: 20 } },
      ],
    });

    const result = await service.getCart('customer-1');

    expect(result.totalItems).toBe(3);
    expect(result.totalAmount).toBe(51);
  });

  it('should throw if order does not belong to customer', async () => {
    prisma.order.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.getOrderById('customer-1', 'order-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
