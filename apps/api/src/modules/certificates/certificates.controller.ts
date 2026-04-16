import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.service.list(req.tenantId);
  }

  @Public()
  @Get('validate/:code')
  validatePublic(
    @Req() req: { headers: Record<string, string | string[] | undefined> },
    @Param('code') code: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.service.validatePublic(
      tenantId ?? (typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : ''),
      code,
    );
  }

  @Public()
  @Get('validate')
  validatePublicQuery(
    @Req() req: { headers: Record<string, string | string[] | undefined> },
    @Query('code') code: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.service.validatePublic(
      tenantId ?? (typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : ''),
      code,
    );
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  issue(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateCertificateDto) {
    return this.service.issue(req.tenantId, dto, req.user?.sub);
  }
}
