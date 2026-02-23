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
    parcelId: string;
    checklist?: MobileChecklistDto;
    location?: MobileLocationDto;
    photoBase64?: string;
}
export declare class MobileSyncDto {
    projectId?: string;
    items: MobileSyncItemDto[];
}
export {};
