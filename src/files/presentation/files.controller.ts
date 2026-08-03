import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { FilesService } from '../infrastructure/files.service';

@ApiTags('files')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2' })
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
  @ApiCreatedResponse()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.filesService.upload(file);
  }

  @Get('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View an image stored in Cloudflare R2' })
  @ApiQuery({ name: 'key', example: 'uploads/file.png' })
  @ApiOkResponse({ description: 'Image stream' })
  async getImage(
    @Query('key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    if (!key) {
      throw new BadRequestException('File key is required.');
    }

    const image = await this.filesService.getImage(key);

    response.set('Content-Type', image.contentType);
    response.set('Content-Disposition', 'inline');

    if (image.contentLength !== undefined) {
      response.set('Content-Length', image.contentLength.toString());
    }

    return new StreamableFile(image.body);
  }

  @Get('images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List images stored in Cloudflare R2' })
  @ApiOkResponse({ description: 'Images list' })
  async getImages(): Promise<
    Array<{
      key: string;
      size?: number;
      lastModified?: Date;
      url?: string;
      viewUrl: string;
    }>
  > {
    const images = await this.filesService.listImages();

    return images.map((image) => ({
      ...image,
      viewUrl: `/api/files/image?key=${encodeURIComponent(image.key)}`,
    }));
  }
}
