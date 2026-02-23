import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateLetterTemplateDto,
  GenerateLetterBatchDto,
  PreviewTemplateDto,
  UpdateLetterStatusDto,
  UpdateLetterTemplateDto,
} from './dto/letters.dto';
import { NotificationsLettersService } from './notifications-letters.service';

@ApiTags('notifications-letters')
@ApiBearerAuth()
@Controller('notifications-letters')
export class NotificationsLettersController {
  constructor(private readonly service: NotificationsLettersService) {}

  @Get('templates')
  listTemplates(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listTemplates(req.tenantId, projectId);
  }

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  createTemplate(@Req() req: { tenantId: string }, @Body() dto: CreateLetterTemplateDto) {
    return this.service.createTemplate(req.tenantId, dto);
  }

  @Patch('templates/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateTemplate(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateLetterTemplateDto,
  ) {
    return this.service.updateTemplate(req.tenantId, projectId, id, dto);
  }

  @Post('templates/preview')
  previewTemplate(@Body() dto: PreviewTemplateDto) {
    return this.service.previewTemplate(dto);
  }

  @Post('batches/generate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  generateBatch(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: GenerateLetterBatchDto,
  ) {
    return this.service.generateBatch(req.tenantId, dto, req.user?.sub);
  }

  @Get('batches')
  listBatches(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listBatches(req.tenantId, projectId);
  }

  @Get('batches/:id')
  getBatch(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.findBatchById(req.tenantId, projectId, id);
  }

  @Patch('batches/:batchId/letters/:letterId/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateLetterStatus(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('batchId') batchId: string,
    @Param('letterId') letterId: string,
    @Body() dto: UpdateLetterStatusDto,
  ) {
    return this.service.updateLetterStatus(req.tenantId, projectId, batchId, letterId, dto);
  }

  @Get('batches/:batchId/letters/:letterId/download')
  getDownloadUrl(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('batchId') batchId: string,
    @Param('letterId') letterId: string,
  ) {
    return this.service.getLetterDownloadUrl(req.tenantId, projectId, batchId, letterId);
  }
}

