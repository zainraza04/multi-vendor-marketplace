import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: Role;
}
