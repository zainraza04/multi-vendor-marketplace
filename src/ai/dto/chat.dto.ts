import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    example: 'Write a short welcome message for a new customer.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  prompt: string;
}
