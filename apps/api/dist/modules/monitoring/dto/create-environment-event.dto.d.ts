export declare class CreateEnvironmentEventDto {
    type: string;
    title: string;
    severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    lat: number;
    lng: number;
    source?: string;
    sourceMode?: 'MANUAL' | 'SENSOR' | 'SATELLITE' | 'API';
    sourceAdapter?: string;
    externalReference?: string;
    observedAt?: string;
    evidenceKeys?: string[];
    classification?: string;
}
