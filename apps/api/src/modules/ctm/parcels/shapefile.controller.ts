import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { ShapefileService } from './shapefile.service';
import { ParcelsService } from './parcels.service';

@Controller('ctm/parcels/import')
export class ShapefileController {
  constructor(
    private readonly shapefileService: ShapefileService,
    private readonly parcelsService: ParcelsService,
  ) {}

  @Post('shp')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async importShp(
    @UploadedFile() file: Express.Multer.File,
    @Query('projectId') projectId: string | undefined,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado. Use field name "file".');

    const parsed = await this.shapefileService.parse(file.buffer, file.originalname);

    const tenantId = (req as any).tenantId || 'demo';
    const userId = (req as any).user?.sub || (req as any).user?.id;

    return this.parcelsService.importGeojson(
      tenantId,
      projectId,
      parsed,
      'SHAPEFILE',
      file.originalname,
      true,
      userId,
    );
  }
}
