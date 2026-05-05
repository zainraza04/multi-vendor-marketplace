import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly modelName = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService) {}

  async chat(prompt: string) {
    const message = prompt?.trim();

    if (!message) {
      throw new BadRequestException('Prompt is required');
    }

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('Gemini API key is not configured');
    }

    try {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(message);
      const reply = result.response.text().trim();

      return { reply };
    } catch (error) {
      this.logger.error('Gemini chat failed', error as Error);
      throw new ServiceUnavailableException('AI service is unavailable');
    }
  }
}
