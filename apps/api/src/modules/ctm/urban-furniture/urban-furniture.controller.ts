import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UrbanFurnitureService } from './urban-furniture.service';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('ctm/urban-furniture')
export class UrbanFurnitureController {
  constructor(private readonly urbanFurnitureService: UrbanFurnitureService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.urbanFurnitureService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  async geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    const items = await this.urbanFurnitureService.list(req.tenantId, projectId, bbox);
    return {
      type: 'FeatureCollection',
      features: items.map((item) => ({
        type: 'Feature',
        id: item.id,
        geometry: item.location,
        properties: {
          featureType: 'urban_furniture',
          furnitureId: item.id,
          type: item.type,
          tipo: item.tipo ?? item.type,
          condition: item.condition,
          estadoConservacao: item.estadoConservacao ?? item.condition,
          notes: item.notes,
          observacao: item.observacao ?? item.notes,
          photoUrl: item.photoUrl,
          fotoUrl: item.fotoUrl ?? item.photoUrl,
        },
      })),
    };
  }

  @Get(':id')
  get(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.urbanFurnitureService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: CreateUrbanFurnitureDto,
  ) {
    return this.urbanFurnitureService.create(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateUrbanFurnitureDto,
  ) {
    return this.urbanFurnitureService.update(req.tenantId, projectId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.urbanFurnitureService.remove(req.tenantId, projectId, id);
  }
}
