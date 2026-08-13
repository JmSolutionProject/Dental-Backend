import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { ServerResponse } from 'node:http';
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
  @ApiOperation({
    summary: 'Upload a file to Cloudflare R2 (patient attachment)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        patientId: {
          type: 'string',
          description: 'ID del paciente (opcional)',
        },
        description: {
          type: 'string',
          description: 'Descripción corta del adjunto (opcional)',
        },
        servicioId: {
          type: 'string',
          description: 'ID del servicio al que pertenece (opcional)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file?: Express.Multer.File,
    @Body('patientId') patientId?: string,
    @Body('description') description?: string,
    @Body('servicioId') servicioId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.filesService.upload(file, {
      patientId: this.toPositiveInt(patientId),
      description,
      servicioId: this.toPositiveInt(servicioId),
    });
  }

  @Get('patient/:patientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List attachments of a patient' })
  @ApiOkResponse()
  async listByPatient(@Param('patientId') patientId: string) {
    const id = this.toPositiveInt(patientId);

    if (!id) {
      throw new BadRequestException('Patient id inválido.');
    }

    return this.filesService.listByPatient(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a patient attachment' })
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    const attachmentId = this.toPositiveInt(id);

    if (!attachmentId) {
      throw new BadRequestException('Attachment id inválido.');
    }

    return this.filesService.deleteAdjunto(attachmentId);
  }

  @Get('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View an image stored in Cloudflare R2' })
  @ApiQuery({ name: 'key', example: 'pacientes/1/file.webp' })
  @ApiOkResponse({ description: 'Image stream' })
  async getImage(
    @Query('key') key: string | undefined,
    @Res({ passthrough: true }) response: ServerResponse,
  ): Promise<StreamableFile> {
    if (!key) {
      throw new BadRequestException('File key is required.');
    }

    const image = await this.filesService.getImage(key);

    response.setHeader('Content-Type', image.contentType);
    response.setHeader('Content-Disposition', 'inline');

    if (image.contentLength !== undefined) {
      response.setHeader('Content-Length', image.contentLength);
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

  private toPositiveInt(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    const number = Number(value);

    return Number.isInteger(number) && number > 0 ? number : undefined;
  }
}
