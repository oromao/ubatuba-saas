export interface GovBrSignedDocument {
    documentId: string;
    documentHash: string;
    signerName: string;
    signerCpf: string;
    accountLevel: 'PRATA' | 'OURO';
    signedAt: string;
    authority: string;
    signatureCriptografica: string;
    isValid: boolean;
}
export declare class GovBrSignatureService {
    private rsaKeys;
    private getKeys;
    signDocumentWithGovBr(documentId: string, govBrToken: string, forcedSigner?: {
        name: string;
        cpf: string;
        level?: 'PRATA' | 'OURO';
    }): Promise<GovBrSignedDocument>;
    verifyGovBrSignature(signed: GovBrSignedDocument): boolean;
}
