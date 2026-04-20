import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { Citizen156Service } from './citizen-156.service';

type PublicCreateCallDto = {
  tenantId: string;
  title: string;
  category: string;
  description?: string;
  reporterName?: string;
  reporterContact?: string;
  address?: string;
};

@ApiTags('public')
@Controller('public')
export class PublicCallsController {
  constructor(private readonly service: Citizen156Service) {}

  @Public()
  @Post('calls')
  async createPublicCall(@Body() body: PublicCreateCallDto) {
    const { tenantId, description: _description, address, ...rest } = body;
    // Augment title with address if provided
    const title = address ? `${rest.title} — ${address}` : rest.title;
    const created = await this.service.create(
      tenantId,
      {
        ...rest,
        title,
        attachmentKeys: [],
      },
      'CIDADAO',
    );
    return {
      protocolNumber: (created as any).protocolNumber,
      status: (created as any).status,
      message: `Chamado registrado com sucesso. Protocolo: ${(created as any).protocolNumber}`,
    };
  }

  @Public()
  @Get('calls/:protocol/status')
  async getCallStatus(@Param('protocol') _protocol: string) {
    return { message: 'Use o protocolo com o município para consultar o status.' };
  }
}
