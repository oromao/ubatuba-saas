import {
  Controller,
  Req,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { TenantRequest } from '../../common/guards/tenant.guard';

@ApiTags('uploads')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('files')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: TenantRequest,
  ) {
    const urls = await this.uploadService.saveFiles(files ?? [], req.tenantId);
    return { urls };
  }
}
