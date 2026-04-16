import type { CemeteryPlotStatus } from '../cemetery.schema';
export declare class UpdateCemeteryPlotDto {
    status?: CemeteryPlotStatus;
    ownerName?: string;
    occupantName?: string;
    message?: string;
}
