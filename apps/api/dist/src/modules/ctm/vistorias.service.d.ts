import { Model } from 'mongoose';
import { Vistoria, VistoriaDocument } from './vistoria.schema';
import { CreateVistoriaDto } from './dto/create-vistoria.dto';
import { UpdateVistoriaDto } from './dto/update-vistoria.dto';
export declare class VistoriasService {
    private model;
    constructor(model: Model<VistoriaDocument>);
    create(dto: CreateVistoriaDto, userId: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(tenantId: string, parcelId?: string): Promise<(import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(id: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateVistoriaDto, tenantId: string): Promise<import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    transicao(id: string, newStatus: string, observacao: string, userId: string, tenantId: string): Promise<import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addFotos(id: string, urls: string[], tenantId: string): Promise<import("mongoose").Document<unknown, {}, VistoriaDocument, {}, {}> & Vistoria & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
}
