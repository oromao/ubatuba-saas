import { CacheService } from '../shared/cache.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsRepository } from './alerts.repository';
export declare class AlertsService {
    private readonly alertsRepository;
    private readonly cacheService;
    constructor(alertsRepository: AlertsRepository, cacheService: CacheService);
    list(tenantId: string): Promise<import("./alert.schema").EnvironmentalAlertDocument[]>;
    findById(tenantId: string, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    create(tenantId: string, dto: CreateAlertDto): Promise<import("./alert.schema").EnvironmentalAlertDocument>;
    update(tenantId: string, id: string, dto: UpdateAlertDto): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    ack(tenantId: string, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    resolve(tenantId: string, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
