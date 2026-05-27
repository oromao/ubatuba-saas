import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesService } from './certificates.service';
import { GovBrSignatureService } from '../../common/services/govbr-signature.service';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly service: CertificatesService,
    private readonly govBrSignatureService: GovBrSignatureService,
  ) {}

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

  @Post('govbr-sign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  async govBrSign(
    @Req() req: { user?: { sub?: string } },
    @Body() body: { documentId: string; govBrToken: string; name?: string; cpf?: string; level?: 'PRATA' | 'OURO' },
  ) {
    return this.govBrSignatureService.signDocumentWithGovBr(
      body.documentId,
      body.govBrToken,
      body.name && body.cpf ? { name: body.name, cpf: body.cpf, level: body.level } : undefined,
    );
  }

  @Public()
  @Post('validate-signature')
  async validateSignature(
    @Body() body: {
      documentId: string;
      documentHash: string;
      signerName: string;
      signerCpf: string;
      accountLevel: 'PRATA' | 'OURO';
      signedAt: string;
      authority: string;
      signatureCriptografica: string;
    },
  ) {
    const isValid = this.govBrSignatureService.verifyGovBrSignature({
      ...body,
      isValid: true,
    });
    return {
      isValid,
      documentId: body.documentId,
      signerName: body.signerName,
      signerCpf: body.signerCpf,
      accountLevel: body.accountLevel,
      signedAt: body.signedAt,
      authority: body.authority,
    };
  }
}
