import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import {
  DeleteUserResponseDto,
  ProfileResponseDto,
  UserResponseDto,
} from '../common/swagger/user-response.dto';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private static readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  private static getFilename(
    _: unknown,
    file: { originalname: string },
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
  }

  private static fileFilter(
    _: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) {
    if (!UsersController.allowedMimeTypes.includes(file.mimetype)) {
      cb(
        new BadRequestException('Only JPG, PNG, and WEBP files are allowed'),
        false,
      );
      return;
    }

    cb(null, true);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.VENDOR, Role.CUSTOMER)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Patch('me/profile-picture')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.VENDOR, Role.CUSTOMER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/avatars',
        filename: UsersController.getFilename,
      }),
      fileFilter: UsersController.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadMyProfilePicture(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: { filename: string } | undefined,
    @Req()
    request: { protocol: string; get: (header: string) => string | undefined },
  ) {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }

    const host = request.get('host');

    if (!host) {
      throw new BadRequestException(
        'Could not resolve request host for profile picture URL',
      );
    }

    const avatarUrl = `${request.protocol}://${host}/uploads/avatars/${file.filename}`;

    return this.usersService.updateProfilePicture(userId, avatarUrl);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DeleteUserResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
