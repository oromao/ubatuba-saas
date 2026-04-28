import { CacheService } from '../shared/cache.service';
import { ProcessesService } from '../processes/processes.service';
import { AlertsService } from '../alerts/alerts.service';
import { AssetsService } from '../assets/assets.service';
import { PermitsWorksService } from '../permits-works/permits-works.service';
import { PermitsBusinessService } from '../permits-business/permits-business.service';
import { Citizen156Service } from '../citizen-156/citizen-156.service';
import { EnvironmentService } from '../environment/environment.service';
import { PublicWorksService } from '../public-works/public-works.service';
import { CemeteryService } from '../cemetery/cemetery.service';
import { ParcelsService } from '../ctm/parcels/parcels.service';
import { Model } from 'mongoose';
import { DashboardLayoutDocument } from './dashboard-layout.schema';
export declare class DashboardService {
    private readonly processesService;
    private readonly alertsService;
    private readonly assetsService;
    private readonly permitsWorksService;
    private readonly permitsBusinessService;
    private readonly citizen156Service;
    private readonly environmentService;
    private readonly publicWorksService;
    private readonly cemeteryService;
    private readonly parcelsService;
    private readonly cacheService;
    private readonly layoutModel;
    constructor(processesService: ProcessesService, alertsService: AlertsService, assetsService: AssetsService, permitsWorksService: PermitsWorksService, permitsBusinessService: PermitsBusinessService, citizen156Service: Citizen156Service, environmentService: EnvironmentService, publicWorksService: PublicWorksService, cemeteryService: CemeteryService, parcelsService: ParcelsService, cacheService: CacheService, layoutModel: Model<DashboardLayoutDocument>);
    getKpis(tenantId: string): Promise<{}>;
    getExecutive(tenantId: string, userId: string): Promise<{}>;
    getLayout(tenantId: string, userId: string): Promise<{
        viewMode: string;
        widgets: {
            id: string;
            visible: boolean;
            order: number;
        }[];
    }>;
    saveLayout(tenantId: string, userId: string, layout: {
        viewMode?: 'executive' | 'operational';
        widgets: Array<{
            id: string;
            visible: boolean;
            order: number;
        }>;
    }): Promise<import("mongoose").FlattenMaps<DashboardLayoutDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
