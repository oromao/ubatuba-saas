import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { IntegrationHubController } from './integration-hub.controller';
import { IntegrationHubService } from './integration-hub.service';

@Module({
  imports: [ProjectsModule, AuthModule],
  controllers: [IntegrationHubController],
  providers: [IntegrationHubService, CacheService],
})
export class IntegrationHubModule {}
