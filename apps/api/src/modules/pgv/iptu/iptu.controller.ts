import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { IptuService, IptuCalculationResult, IptuBatchResult } from './iptu.service';

@ApiTags('IPTU')
@Controller('iptu')
export class IptuController {
  constructor(private readonly iptuService: IptuService) {}

  @Post('calcular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular IPTU para uma parcela',
    description: 'Calcula o IPTU devido (valor venal × alíquota) para uma parcela específica.',
  })
  @ApiResponse({ status: 200, description: 'Resultado do cálculo IPTU' })
  async calcular(@Body() body: {
    parcelId: string;
    tenantId: string;
    projectId: string;
    year?: number;
  }): Promise<IptuCalculationResult> {
    return this.iptuService.calculateForParcel(body);
  }

  @Post('calcular/lote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular IPTU em lote',
    description: 'Calcula o IPTU para todas as parcelas de um projeto (ou zona).',
  })
  @ApiResponse({ status: 200, description: 'Resultado do cálculo em lote' })
  async calcularLote(@Body() body: {
    tenantId: string;
    projectId: string;
    year?: number;
    zoneId?: string;
  }): Promise<IptuBatchResult> {
    return this.iptuService.calculateBatch(
      body.tenantId,
      body.projectId,
      body.year,
      body.zoneId,
    );
  }

  @Get('aliquota')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar alíquota IPTU de uma parcela',
    description: 'Retorna a alíquota IPTU efetiva para uma parcela, baseada na sua zona.',
  })
  @ApiQuery({ name: 'parcelId', required: true, description: 'ID da parcela' })
  async aliquota(@Query('parcelId') parcelId: string) {
    return this.iptuService.getAliquota(parcelId);
  }
}
