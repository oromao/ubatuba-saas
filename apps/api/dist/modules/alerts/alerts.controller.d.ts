import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    list(req: {
        tenantId: string;
    }): Promise<import("./alert.schema").EnvironmentalAlertDocument[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    create(req: {
        tenantId: string;
    }, dto: CreateAlertDto): Promise<import("./alert.schema").EnvironmentalAlertDocument>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateAlertDto): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    ack(req: {
        tenantId: string;
    }, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    resolve(req: {
        tenantId: string;
    }, id: string): Promise<import("./alert.schema").EnvironmentalAlertDocument | null>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
