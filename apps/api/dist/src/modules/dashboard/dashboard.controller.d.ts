import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKpis(req: {
        tenantId: string;
    }): Promise<{}>;
    getExecutive(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }): Promise<{}>;
    getLayout(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }): Promise<{
        viewMode: string;
        widgets: {
            id: string;
            visible: boolean;
            order: number;
        }[];
    }>;
    saveLayout(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, body: {
        viewMode?: 'executive' | 'operational';
        widgets: Array<{
            id: string;
            visible: boolean;
            order: number;
        }>;
    }): Promise<import("mongoose").FlattenMaps<import("./dashboard-layout.schema").DashboardLayoutDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
