declare class MobileChecklistDto {
    occupancyChecked?: boolean;
    addressChecked?: boolean;
    infrastructureChecked?: boolean;
    notes?: string;
}
declare class MobileLocationDto {
    lat: number;
    lng: number;
}
declare class MobileSyncItemDto {
    clientId?: string;
    parcelId: string;
    checklist?: MobileChecklistDto;
    location?: MobileLocationDto;
    photoBase64?: string;
    parcelUpdatedAt?: string;
    evidences?: Array<{
        clientId: string;
        fileName?: string;
        mimeType?: string;
        base64: string;
        checksum?: string;
        capturedAt?: string;
        size?: number;
        status?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
        retries?: number;
        lastError?: string;
        lastAttemptAt?: string;
    }>;
}
export declare class MobileSyncDto {
    projectId?: string;
    items: MobileSyncItemDto[];
}
export {};
