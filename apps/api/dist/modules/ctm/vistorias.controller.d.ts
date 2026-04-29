import { VistoriasService } from './vistorias.service';
import { CreateVistoriaDto } from './dto/create-vistoria.dto';
import { UpdateVistoriaDto } from './dto/update-vistoria.dto';
import { TransicaoVistoriaDto } from './dto/transicao-vistoria.dto';
import { UploadService } from '../uploads/upload.service';
import { TenantRequest } from '../../common/guards/tenant.guard';
export declare class VistoriasController {
    private readonly service;
    private readonly uploadService;
    constructor(service: VistoriasService, uploadService: UploadService);
    create(dto: CreateVistoriaDto, req: TenantRequest): Promise<import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(parcelId: string, req: TenantRequest): Promise<(import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string, req: TenantRequest): Promise<import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateVistoriaDto, req: TenantRequest): Promise<import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    transicao(id: string, dto: TransicaoVistoriaDto, req: TenantRequest): Promise<import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addFotos(id: string, files: Express.Multer.File[], req: TenantRequest): Promise<import("mongoose").Document<unknown, {}, import("./vistoria.schema").VistoriaDocument, {}, {}> & import("./vistoria.schema").Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, req: TenantRequest): Promise<{
        deleted: boolean;
    }>;
}
