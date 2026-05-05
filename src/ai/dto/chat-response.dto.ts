import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    example: 'Welcome aboard! We are excited to have you with us.',
  })
  reply: string;
}
