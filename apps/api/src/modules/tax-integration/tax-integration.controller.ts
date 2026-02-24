import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTaxConnectorDto, RunTaxSyncDto, UpdateTaxConnectorDto } from './dto/tax-integration.dto';
import { TaxIntegrationService } from './tax-integration.service';

@ApiTags('tax-integration')
@ApiBearerAuth()
@Controller('tax-integration')
export class TaxIntegrationController {
  constructor(private readonly service: TaxIntegrationService) {}

  @Get('echo')
  echoIntegration() {
    return {
      data: [
        {
          inscricao: '123',
          contribuinte: 'JOAO DA SILVA',
          endereco: 'RUA A, 100',
          valor_venal: 120000,
        },
      ],
    };
  }

  @Post('echo')
  echoIntegrationPost(@Body() body: Record<string, unknown>) {
    return { data: body };
  }

  @Get('connectors')
  listConnectors(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listConnectors(req.tenantId, projectId);
  }

  @Post('connectors')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  createConnector(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreateTaxConnectorDto,
  ) {
    return this.service.createConnector(req.tenantId, dto, req.user?.sub);
  }

  @Patch('connectors/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateConnector(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateTaxConnectorDto,
  ) {
    return this.service.updateConnector(req.tenantId, projectId, id, dto);
  }

  @Post('connectors/:id/test-connection')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  testConnection(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.testConnection(req.tenantId, projectId, id, req.user?.sub);
  }

  @Post('connectors/:id/run-sync')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  runSync(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: RunTaxSyncDto,
  ) {
    return this.service.runSync(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Get('connectors/:id/logs')
  listLogs(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.listLogs(req.tenantId, projectId, id);
  }
}
