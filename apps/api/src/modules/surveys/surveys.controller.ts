import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CompleteSurveyUploadDto,
  CreateSurveyDto,
  RequestSurveyUploadDto,
  UpdateSurveyDto,
  UpdateSurveyQaDto,
} from './dto/surveys.dto';
import { SurveysService } from './surveys.service';

@ApiTags('surveys')
@ApiBearerAuth()
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.surveysService.list(req.tenantId, projectId);
  }

  @Get(':id')
  getById(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.surveysService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateSurveyDto) {
    return this.surveysService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateSurveyDto,
  ) {
    return this.surveysService.update(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Post(':id/files/presign-upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  requestUpload(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: RequestSurveyUploadDto,
  ) {
    return this.surveysService.requestUpload(req.tenantId, projectId, id, dto);
  }

  @Post(':id/files/complete')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  completeUpload(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: CompleteSurveyUploadDto,
  ) {
    return this.surveysService.completeUpload(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Get(':id/files')
  listFiles(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.surveysService.listFiles(req.tenantId, projectId, id);
  }

  @Get(':id/files/:fileId/download')
  getFileDownload(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    return this.surveysService.getFileDownload(req.tenantId, projectId, id, fileId);
  }

  @Patch(':id/qa')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  updateQa(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateSurveyQaDto,
  ) {
    return this.surveysService.updateQa(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  publish(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.surveysService.publish(req.tenantId, projectId, id, req.user?.sub);
  }
}

