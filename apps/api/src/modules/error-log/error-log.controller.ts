import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ErrorLogService } from '../../common/services/error-log.service';

@Controller('health')
export class ErrorLogController {
  constructor(private readonly service: ErrorLogService) {}

  @Get('errors')
  async listErrors(
    @Query('status') status?: string,
    @Query('unresolved') unresolved?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: Record<string, unknown> = {};
    if (status) filters.status = parseInt(status, 10);
    if (unresolved === 'true') filters.unresolved = true;
    if (limit) filters.limit = parseInt(limit, 10);
    const entries = await this.service.list(filters as any);
    const unresolvedCount = await this.service.countUnresolved();
    return { entries, unresolvedCount, total: entries.length };
  }

  @Get('errors/stats')
  async getStats(@Query('hours') hours?: string) {
    return this.service.getStats(hours ? parseInt(hours, 10) : 24);
  }

  @Post('errors/:id/resolve')
  async resolveError(@Param('id') id: string) {
    await this.service.markResolved(id, 'system');
    return { resolved: true };
  }
}
