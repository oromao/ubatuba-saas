import { CacheService } from '../shared/cache.service';
import { Layer, LayerDocument } from './layer.schema';
import { LayersRepository } from './layers.repository';
import { UpdateLayerDto } from './dto/update-layer.dto';
import { ImportLayerDto, BulkImportLayersDto } from './dto/import-layer.dto';
type LayerResponse = Layer & {
    id: string;
    legendUrl?: string;
    tileUrl?: string;
};
export declare class LayersService {
    private readonly layersRepository;
    private readonly cacheService;
    private readonly logger;
    constructor(layersRepository: LayersRepository, cacheService: CacheService);
    private buildGeoserverTileUrl;
    private buildLegendUrl;
    private toResponse;
    list(tenantId: string): Promise<LayerResponse[]>;
    update(tenantId: string, id: string, dto: UpdateLayerDto): Promise<(import("mongoose").Document<unknown, {}, LayerDocument, {}, {}> & Layer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    importLayer(tenantId: string, dto: ImportLayerDto): Promise<LayerResponse>;
    bulkImportLayers(tenantId: string, dto: BulkImportLayersDto): Promise<{
        imported: number;
        errors: number;
        errorDetails: Array<{
            layer: string;
            message: string;
        }>;
    }>;
    importSpZoneamentoLayers(tenantId: string): Promise<{
        imported: number;
        errors: number;
        errorDetails: Array<{
            layer: string;
            message: string;
        }>;
    }>;
}
export {};
