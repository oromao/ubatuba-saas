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
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { VistoriasService } from './vistorias.service';
import { CreateVistoriaDto } from './dto/create-vistoria.dto';
import { UpdateVistoriaDto } from './dto/update-vistoria.dto';
import { TransicaoVistoriaDto } from './dto/transicao-vistoria.dto';
import { UploadService } from '../uploads/upload.service';
import { TenantRequest } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@ApiTags('ctm-vistorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ctm/vistorias')
export class VistoriasController {
  constructor(
    private readonly service: VistoriasService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Criar nova vistoria para uma parcela' })
  create(@Body() dto: CreateVistoriaDto, @Req() req: TenantRequest) {
    return this.service.create(dto, req.user?.sub ?? '', req.tenantId ?? '');
  }

  @Get()
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  @ApiOperation({ summary: 'Listar vistorias filtradas por parcela' })
  findAll(@Query('parcelId') parcelId: string, @Req() req: TenantRequest) {
    return this.service.findAll(req.tenantId ?? '', parcelId);
  }

  @Get(':id')
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  @ApiOperation({ summary: 'Obter detalhes de uma vistoria' })
  findOne(@Param('id') id: string, @Req() req: TenantRequest) {
    return this.service.findById(id, req.tenantId ?? '');
  }

  @Patch(':id')
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar dados de uma vistoria' })
  update(@Param('id') id: string, @Body() dto: UpdateVistoriaDto, @Req() req: TenantRequest) {
    return this.service.update(id, dto, req.tenantId ?? '');
  }

  @Post(':id/transicao')
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Mudar status da vistoria (Workflow)' })
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
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Upload de fotos para uma vistoria' })
  @UseInterceptors(FilesInterceptor('files', 10, { storage: memoryStorage() }))
  async addFotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: TenantRequest,
  ) {
    const urls = await this.uploadService.saveFiles(files ?? [], req.tenantId ?? '');
    return this.service.addFotos(id, urls, req.tenantId ?? '');
  }

  @Delete(':id')
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Remover vistoria' })
  remove(@Param('id') id: string, @Req() req: TenantRequest) {
    return this.service.remove(id, req.tenantId ?? '');
  }
}
