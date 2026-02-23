import { Injectable } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string, bbox?: string) {
    return this.assetsRepository.list(tenantId, bbox);
  }

  findById(tenantId: string, id: string) {
    return this.assetsRepository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreateAssetDto) {
    const created = await this.assetsRepository.create({
      tenantId: asObjectId(tenantId),
      name: dto.name,
      category: dto.category,
      status: 'ATIVO',
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
    });
    await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateAssetDto) {
    const updated = await this.assetsRepository.update(tenantId, id, dto);
    await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.assetsRepository.delete(tenantId, id);
    await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
    return { success: true };
  }
}
