import { CacheService } from '../shared/cache.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsRepository } from './alerts.repository';
export declare class AlertsService {
    private readonly alertsRepository;
    private readonly cacheService;
    constructor(alertsRepository: AlertsRepository, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateAlertDto): Promise<import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateAlertDto): Promise<(import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    ack(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    resolve(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./alert.schema").EnvironmentalAlertDocument, {}, {}> & import("./alert.schema").EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
