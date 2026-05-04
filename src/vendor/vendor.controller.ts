import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('vendor')
@ApiTags('Vendor')
@ApiBearerAuth('access-token')
export class VendorController {}
