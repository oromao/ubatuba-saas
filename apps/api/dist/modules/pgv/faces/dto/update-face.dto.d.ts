import { LineGeometry } from '../../../../common/utils/geo';
export declare class UpdateFaceDto {
    code?: string;
    logradouroId?: string;
    zoneId?: string;
    zonaValorId?: string;
    landValuePerSqm?: number;
    valorTerrenoM2?: number;
    lado?: string;
    trecho?: string;
    observacoes?: string;
    metadados?: {
        lado?: string;
        trecho?: string;
        observacoes?: string;
    };
    geometry?: LineGeometry;
}
