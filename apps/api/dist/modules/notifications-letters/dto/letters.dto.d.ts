export declare class CreateLetterTemplateDto {
    name: string;
    html: string;
    projectId?: string;
}
export declare class UpdateLetterTemplateDto {
    html?: string;
    isActive?: boolean;
}
export declare class PreviewTemplateDto {
    html: string;
    variables?: Record<string, string | number>;
}
export declare class GenerateLetterBatchDto {
    templateId: string;
    projectId?: string;
    parcelWorkflowStatus?: string;
    parcelStatus?: string;
}
export declare class UpdateLetterStatusDto {
    status: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
}
