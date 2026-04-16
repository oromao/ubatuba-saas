import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateLayerDto } from './dto/update-layer.dto';
import { LayersService } from './layers.service';

@Controller('layers')
export class LayersController {
  constructor(private readonly layersService: LayersService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.layersService.list(req.tenantId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string }, @Param('id') id: string, @Body() dto: UpdateLayerDto) {
    return this.layersService.update(req.tenantId, id, dto);
  }

  @Post('import-sp-zoneamento')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  importSpZoneamento(@Req() req: { tenantId: string }) {
    return this.layersService.importSpZoneamentoLayers(req.tenantId);
  }
}
