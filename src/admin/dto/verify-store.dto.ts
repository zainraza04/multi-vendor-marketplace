import { IsBoolean } from 'class-validator';

export class VerifyStoreDto {
  @IsBoolean()
  isVerified: boolean;
}
