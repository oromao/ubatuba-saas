import { UpdateLayerDto } from './dto/update-layer.dto';
import { LayersService } from './layers.service';
export declare class LayersController {
    private readonly layersService;
    constructor(layersService: LayersService);
    list(req: {
        tenantId: string;
    }): Promise<(import("./layer.schema").Layer & {
        id: string;
        legendUrl?: string;
        tileUrl?: string;
    })[]>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateLayerDto): Promise<(import("mongoose").Document<unknown, {}, import("./layer.schema").LayerDocument, {}, {}> & import("./layer.schema").Layer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
