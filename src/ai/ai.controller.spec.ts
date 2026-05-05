import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  let service: jest.Mocked<AiService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            chat: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a chat reply', async () => {
    service.chat.mockResolvedValueOnce({ reply: 'Hello there!' });

    await expect(controller.chat({ prompt: 'Hi' })).resolves.toEqual({
      reply: 'Hello there!',
    });
  });
});
