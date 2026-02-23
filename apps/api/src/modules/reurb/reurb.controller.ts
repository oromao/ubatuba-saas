import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { fromEventPattern, map, Observable } from 'rxjs';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CompleteDocumentUploadDto,
  CreatePendencyDto,
  CreateReurbFamilyDto,
  DeliverableCommandDto,
  RequestDocumentUploadDto,
  UpdatePendencyStatusDto,
  UpdateReurbFamilyDto,
  UpsertTenantConfigDto,
} from './dto/reurb.dto';
import { ReurbDeliverableKind } from './reurb.schema';
import { ReurbService } from './reurb.service';

@ApiTags('reurb')
@ApiBearerAuth()
@Controller('reurb')
export class ReurbController {
  constructor(private readonly service: ReurbService) {}

  @Get('tenant-config')
  getTenantConfig(@Req() req: { tenantId: string }) {
    return this.service.getTenantConfig(req.tenantId);
  }

  @Put('tenant-config')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  upsertTenantConfig(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: UpsertTenantConfigDto,
  ) {
    return this.service.upsertTenantConfig(req.tenantId, dto, req.user?.sub);
  }

  @Post('families')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  createFamily(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreateReurbFamilyDto,
  ) {
    return this.service.createFamily(req.tenantId, dto, req.user?.sub);
  }

  @Get('families')
  listFamilies(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('nucleus') nucleus?: string,
    @Query('q') q?: string,
  ) {
    return this.service.listFamilies(req.tenantId, projectId, { status, nucleus, q });
  }

  @Patch('families/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateFamily(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateReurbFamilyDto,
  ) {
    return this.service.updateFamily(req.tenantId, id, dto, projectId, req.user?.sub);
  }

  @Post('families/export.csv')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  exportFamiliesCsv(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.exportFamiliesCsv(req.tenantId, dto.projectId, req.user?.sub);
  }

  @Post('families/export.xlsx')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  exportFamiliesXlsx(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.exportFamiliesXlsx(req.tenantId, dto.projectId, req.user?.sub);
  }

  @Post('planilha-sintese/generate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  generatePlanilha(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.generatePlanilhaSintese(req.tenantId, dto.projectId, req.user?.sub);
  }

  @Post('pendencies')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  createPendency(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreatePendencyDto,
  ) {
    return this.service.createPendency(req.tenantId, dto, req.user?.sub);
  }

  @Get('pendencies')
  listPendencies(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('nucleus') nucleus?: string,
    @Query('familyId') familyId?: string,
  ) {
    return this.service.listPendencies(req.tenantId, projectId, { status, nucleus, familyId });
  }

  @Patch('pendencies/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updatePendencyStatus(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdatePendencyStatusDto,
  ) {
    return this.service.updatePendencyStatus(req.tenantId, id, dto, projectId, req.user?.sub);
  }

  @Sse('pendencies/stream')
  pendenciesStream(@Req() req: { tenantId: string }): Observable<MessageEvent> {
    return fromEventPattern<{ tenantId: string; [key: string]: unknown }>(
      (handler) => this.service.getPendencyEvents().on('updated', handler),
      (handler) => this.service.getPendencyEvents().off('updated', handler),
    ).pipe(
      map((event) => {
        if (event.tenantId !== req.tenantId) {
          return { type: 'noop', data: { ignored: true } } as MessageEvent;
        }
        return {
          type: 'pendency-updated',
          data: event,
        } as MessageEvent;
      }),
    );
  }

  @Post('documents/presign-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  requestDocumentUpload(
    @Req() req: { tenantId: string },
    @Body() dto: RequestDocumentUploadDto,
  ) {
    return this.service.requestDocumentUpload(req.tenantId, dto);
  }

  @Post('documents/complete-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  completeDocumentUpload(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CompleteDocumentUploadDto,
  ) {
    return this.service.completeDocumentUpload(req.tenantId, dto, req.user?.sub);
  }

  @Post('cartorio/package')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  generateCartorioPackage(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.generateCartorioPackage(req.tenantId, dto.projectId, req.user?.sub);
  }

  @Get('deliverables')
  listDeliverables(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('kind') kind?: ReurbDeliverableKind,
  ) {
    return this.service.listDeliverables(req.tenantId, projectId, kind);
  }

  @Get('deliverables/:id/download')
  getDeliverableDownload(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.getDeliverableDownload(req.tenantId, id, projectId);
  }
}
