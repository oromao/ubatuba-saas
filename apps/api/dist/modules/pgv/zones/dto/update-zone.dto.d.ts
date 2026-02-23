import { PolygonGeometry } from '../../../../common/utils/geo';
export declare class UpdateZoneDto {
    code?: string;
    codigo?: string;
    name?: string;
    nome?: string;
    description?: string;
    descricao?: string;
    baseLandValue?: number;
    baseConstructionValue?: number;
    valorBaseTerrenoM2?: number;
    valorBaseConstrucaoM2?: number;
    geometry?: PolygonGeometry;
}
