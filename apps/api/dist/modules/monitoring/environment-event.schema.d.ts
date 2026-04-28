import { Document, Types } from 'mongoose';
export type EnvironmentalEventType = 'DESLIZAMENTO' | 'INUNDACAO' | 'QUEIMADA' | 'SUPRESSAO_VEGETACAO' | 'SOLO_EXPOSTO' | 'PRECIPITACAO_EXTREMA' | 'VENTO_FORTE' | 'SENSOR_OFFLINE';
export type EnvironmentalSourceMode = 'MANUAL' | 'SENSOR' | 'SATELLITE' | 'API';
export declare class EnvironmentalEvent {
    tenantId: Types.ObjectId;
    type: EnvironmentalEventType;
    title: string;
    severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    stage: 'INGESTAO' | 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';
    classification?: 'NOVA_EDIFICACAO' | 'AUMENTO_EDIFICACAO' | 'DEMOLICAO' | 'SOLO_EXPOSTO' | 'SUPRESSAO_VEGETACAO' | 'QUEIMADA' | 'DESCARTE_IRREGULAR' | 'LOTE_SEM_MANUTENCAO' | 'OCUPACAO_IRREGULAR';
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    evidenceKeys: string[];
    timeline: Array<{
        id: string;
        stage: EnvironmentalEvent['stage'];
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
    source?: string;
    sourceMode: EnvironmentalSourceMode;
    sourceAdapter?: string;
    externalReference?: string;
    observedAt?: string;
    assignedTo?: string;
    notifiedAt?: string;
    resolvedAt?: string;
}
export type EnvironmentalEventDocument = EnvironmentalEvent & Document;
export declare const EnvironmentalEventSchema: import("mongoose").Schema<EnvironmentalEvent, import("mongoose").Model<EnvironmentalEvent, any, any, any, Document<unknown, any, EnvironmentalEvent, any, {}> & EnvironmentalEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnvironmentalEvent, Document<unknown, {}, import("mongoose").FlatRecord<EnvironmentalEvent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<EnvironmentalEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
