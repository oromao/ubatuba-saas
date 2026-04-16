export declare class UpdateEnvironmentEventDto {
    stage?: 'INGESTAO' | 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';
    message?: string;
    assignedTo?: string;
    evidenceKey?: string;
    sourceAdapter?: string;
}
