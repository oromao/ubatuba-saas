import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VistoriasService } from './vistorias.service';
import { CreateVistoriaDto } from './dto/create-vistoria.dto';
import { UpdateVistoriaDto } from './dto/update-vistoria.dto';
import { TransicaoVistoriaDto } from './dto/transicao-vistoria.dto';
import { UploadService } from '../uploads/upload.service';
import { TenantRequest } from '../../common/guards/tenant.guard';

@Controller('ctm/vistorias')
export class VistoriasController {
  constructor(
    private readonly service: VistoriasService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() dto: CreateVistoriaDto, @Req() req: TenantRequest) {
    return this.service.create(dto, req.user?.sub ?? '', req.tenantId ?? '');
  }

  @Get()
  findAll(@Query('parcelId') parcelId: string, @Req() req: TenantRequest) {
    return this.service.findAll(req.tenantId ?? '', parcelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: TenantRequest) {
    return this.service.findById(id, req.tenantId ?? '');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVistoriaDto, @Req() req: TenantRequest) {
    return this.service.update(id, dto, req.tenantId ?? '');
  }

  @Post(':id/transicao')
  transicao(@Param('id') id: string, @Body() dto: TransicaoVistoriaDto, @Req() req: TenantRequest) {
    return this.service.transicao(
      id,
      dto.status,
      dto.observacao ?? '',
      req.user?.sub ?? '',
      req.tenantId ?? '',
    );
  }

  @Post(':id/fotos')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: memoryStorage() }))
  async addFotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: TenantRequest,
  ) {
    const urls = await this.uploadService.saveFiles(files ?? []);
    return this.service.addFotos(id, urls, req.tenantId ?? '');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: TenantRequest) {
    return this.service.remove(id, req.tenantId ?? '');
  }
}
