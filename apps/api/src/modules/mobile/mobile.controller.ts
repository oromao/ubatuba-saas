import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileService } from './mobile.service';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('ctm-sync')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  sync(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: MobileSyncDto,
  ) {
    return this.mobileService.sync(req.tenantId, dto, req.user?.sub);
  }

  @Get('ctm-sync')
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.mobileService.listRecords(req.tenantId, projectId);
  }
}

