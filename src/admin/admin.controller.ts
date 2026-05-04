import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth('access-token')
export class AdminController {}
