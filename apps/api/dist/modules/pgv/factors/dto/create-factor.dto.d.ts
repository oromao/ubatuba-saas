export declare class CreateFactorDto {
    projectId?: string;
    category: 'LAND' | 'CONSTRUCTION';
    key: string;
    label: string;
    value: number;
    description?: string;
    isDefault?: boolean;
}
