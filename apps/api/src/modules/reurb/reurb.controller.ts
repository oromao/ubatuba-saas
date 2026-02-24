import {
  Body,
  Controller,
  Get,
  Headers,
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
  CompleteProjectDocumentUploadDto,
  CompleteUnitDocumentUploadDto,
  CreatePendencyDto,
  CreateReurbFamilyDto,
  CreateReurbProjectDto,
  CreateReurbUnitDto,
  CreateNotificationTemplateDto,
  DeliverableCommandDto,
  IntegrationPingDto,
  ImportFamiliesCsvDto,
  RequestNotificationEvidenceUploadDto,
  RequestDocumentUploadDto,
  RequestProjectDocumentUploadDto,
  RequestUnitDocumentUploadDto,
  SendNotificationEmailDto,
  AttachNotificationEvidenceDto,
  UpdatePendencyStatusDto,
  UpdateReurbFamilyDto,
  UpdateReurbProjectDto,
  UpdateReurbUnitDto,
  UpdateNotificationTemplateDto,
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

  @Post('projects')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  createProject(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreateReurbProjectDto,
  ) {
    return this.service.createProject(req.tenantId, dto, req.user?.sub);
  }

  @Get('projects')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  listProjects(@Req() req: { tenantId: string }) {
    return this.service.listProjects(req.tenantId);
  }

  @Patch('projects/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  updateProject(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateReurbProjectDto,
  ) {
    return this.service.updateProject(req.tenantId, id, dto, req.user?.sub);
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

  @Post('families/import.csv')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  importFamilies(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: ImportFamiliesCsvDto,
  ) {
    return this.service.importFamiliesCsv(req.tenantId, dto, req.user?.sub);
  }

  @Get('families')
  listFamilies(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('nucleus') nucleus?: string,
    @Query('q') q?: string,
  ) {
    return this.service.listFamilies(
      req.tenantId,
      projectId,
      { status, nucleus, q },
      { actorId: req.user?.sub, purpose },
    );
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
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.exportFamiliesCsv(req.tenantId, dto.projectId, req.user?.sub, purpose);
  }

  @Post('families/export.xlsx')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  exportFamiliesXlsx(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.exportFamiliesXlsx(req.tenantId, dto.projectId, req.user?.sub, purpose);
  }

  @Post('families/export.json')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  exportFamiliesJson(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.exportFamiliesJson(req.tenantId, dto.projectId, req.user?.sub, purpose);
  }

  @Post('planilha-sintese/generate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  generatePlanilha(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.generatePlanilhaSintese(req.tenantId, dto.projectId, req.user?.sub, purpose);
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

  @Post('units')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  createUnit(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreateReurbUnitDto,
  ) {
    return this.service.createUnit(req.tenantId, dto, req.user?.sub);
  }

  @Get('units')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  listUnits(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('code') code?: string,
    @Query('block') block?: string,
    @Query('lot') lot?: string,
  ) {
    return this.service.listUnits(req.tenantId, projectId, { code, block, lot });
  }

  @Patch('units/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateUnit(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateReurbUnitDto,
  ) {
    return this.service.updateUnit(req.tenantId, id, dto, projectId, req.user?.sub);
  }

  @Get('pendencies')
  listPendencies(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('nucleus') nucleus?: string,
    @Query('familyId') familyId?: string,
  ) {
    return this.service.listPendencies(
      req.tenantId,
      projectId,
      { status, nucleus, familyId },
      { actorId: req.user?.sub, purpose },
    );
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

  @Post('project-documents/presign-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  requestProjectDocumentUpload(
    @Req() req: { tenantId: string },
    @Body() dto: RequestProjectDocumentUploadDto,
  ) {
    return this.service.requestProjectDocumentUpload(req.tenantId, dto);
  }

  @Post('project-documents/complete-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  completeProjectDocumentUpload(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CompleteProjectDocumentUploadDto,
  ) {
    return this.service.completeProjectDocumentUpload(req.tenantId, dto, req.user?.sub);
  }

  @Post('unit-documents/presign-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  requestUnitDocumentUpload(
    @Req() req: { tenantId: string },
    @Body() dto: RequestUnitDocumentUploadDto,
  ) {
    return this.service.requestUnitDocumentUpload(req.tenantId, dto);
  }

  @Post('unit-documents/complete-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  completeUnitDocumentUpload(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CompleteUnitDocumentUploadDto,
  ) {
    return this.service.completeUnitDocumentUpload(req.tenantId, dto, req.user?.sub);
  }

  @Get('dossier')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  getDossierSummary(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.getDossierSummary(req.tenantId, projectId);
  }

  @Get('notification-templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  listNotificationTemplates(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listNotificationTemplates(req.tenantId, projectId);
  }

  @Post('notification-templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  createNotificationTemplate(
    @Req() req: { tenantId: string },
    @Body() dto: CreateNotificationTemplateDto,
  ) {
    return this.service.createNotificationTemplate(req.tenantId, dto);
  }

  @Patch('notification-templates/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  updateNotificationTemplate(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.service.updateNotificationTemplate(req.tenantId, projectId, id, dto);
  }

  @Get('notifications')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR')
  listNotifications(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listNotifications(req.tenantId, projectId);
  }

  @Post('notifications/send-email')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  sendNotificationEmail(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: SendNotificationEmailDto,
  ) {
    return this.service.sendNotificationEmail({
      tenantId: req.tenantId,
      projectId: dto.projectId,
      templateId: dto.templateId,
      to: dto.to,
      variables: dto.variables,
      actorId: req.user?.sub,
    });
  }

  @Post('notifications/evidence/presign-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  requestNotificationEvidenceUpload(
    @Req() req: { tenantId: string },
    @Body() dto: RequestNotificationEvidenceUploadDto,
  ) {
    return this.service.requestNotificationEvidenceUpload(req.tenantId, dto.projectId, dto.fileName, dto.mimeType);
  }

  @Post('notifications/:id/evidence')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  attachNotificationEvidence(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: AttachNotificationEvidenceDto,
  ) {
    return this.service.attachNotificationEvidence(req.tenantId, dto.projectId, id, dto.key, req.user?.sub);
  }

  @Post('integrations/ping')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  pingIntegration(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: IntegrationPingDto,
  ) {
    return this.service.pingIntegration(req.tenantId, dto.projectId, dto.payload ?? {}, req.user?.sub);
  }

  @Post('cartorio/package')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  generateCartorioPackage(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Body() dto: DeliverableCommandDto,
  ) {
    return this.service.generateCartorioPackage(req.tenantId, dto.projectId, req.user?.sub, purpose);
  }

  @Get('deliverables')
  listDeliverables(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Query('projectId') projectId?: string,
    @Query('kind') kind?: ReurbDeliverableKind,
  ) {
    return this.service.listDeliverables(req.tenantId, projectId, kind, {
      actorId: req.user?.sub,
      purpose,
    });
  }

  @Get('deliverables/:id/download')
  getDeliverableDownload(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Headers('x-lgpd-purpose') purpose: string | undefined,
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.getDeliverableDownload(req.tenantId, id, projectId, {
      actorId: req.user?.sub,
      purpose,
    });
  }

  @Get('audit')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'LEITOR')
  listAuditLogs(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(Number(limit), 500) : undefined;
    return this.service.listAuditLogs(req.tenantId, projectId, action, parsedLimit);
  }
}
