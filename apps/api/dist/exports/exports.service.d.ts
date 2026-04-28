export declare class ExportsService {
    private readonly logger;
    generateReurbS_Dossier(nucleoId: string, metadata: {
        reqTenant: string;
        actor: string;
    }): Promise<Buffer>;
    private generateCertificatePdf;
}
