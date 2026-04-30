import {
  Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParcelSubdivisionService } from './parcel-subdivision.service';
import { CreateSubdivisionDto } from './dto/create-subdivision.dto';
import { UpdateSubdivisionDto } from './dto/update-subdivision.dto';

@ApiTags('CTM - Desmembramentos')
@Controller('ctm/subdivisions')
export class ParcelSubdivisionController {
  constructor(private readonly service: ParcelSubdivisionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar solicitação de desmembramento/loteamento' })
  async create(@Body() dto: CreateSubdivisionDto & { tenantId: string; projectId: string; userId: string }) {
    return this.service.createRequest(dto.tenantId, dto.projectId, dto.userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar solicitações de desmembramento' })
  async list(
    @Query('tenantId') tenantId: string,
    @Query('projectId') projectId: string,
    @Query('status') status?: string,
    @Query('tipo') tipo?: string,
    @Query('parentParcelId') parentParcelId?: string,
  ) {
    return this.service.listRequests(tenantId, projectId, { status, tipo, parentParcelId });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detalhar solicitação de desmembramento' })
  async get(@Query('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.getRequest(tenantId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar solicitação de desmembramento' })
  async update(
    @Query('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubdivisionDto,
  ) {
    return this.service.updateRequest(tenantId, id, dto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar e executar desmembramento' })
  async approve(
    @Query('tenantId') tenantId: string,
    @Query('projectId') projectId: string,
    @Query('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.approve(tenantId, projectId, id, userId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeitar desmembramento' })
  async reject(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { motivoRejeicao: string },
  ) {
    return this.service.reject(tenantId, id, userId, body.motivoRejeicao);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar desmembramento' })
  async cancel(@Query('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.cancel(tenantId, id);
  }

  @Get('parcels/:parcelId/children')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar parcelas filhas de um desmembramento' })
  async children(@Query('tenantId') tenantId: string, @Param('parcelId') parcelId: string) {
    return this.service.getChildren(tenantId, parcelId);
  }

  @Get('parcels/:parcelId/parents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cadeia de parcelas pai' })
  async parents(@Query('tenantId') tenantId: string, @Param('parcelId') parcelId: string) {
    return this.service.getParentChain(tenantId, parcelId);
  }
}
