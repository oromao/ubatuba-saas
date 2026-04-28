export declare class UpdateAlertDto {
    title?: string;
    level?: string;
    status?: string;
    stage?: 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';
    evidenceKeys?: string[];
    assignedTo?: string;
}
