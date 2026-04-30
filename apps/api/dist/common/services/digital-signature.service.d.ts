export interface SignedPayload {
    payload: Record<string, unknown>;
    signature: string;
    algorithm: string;
    signedAt: string;
    publicKeyPem: string;
}
export declare class DigitalSignatureService {
    private keyPair;
    getKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    signPayload(payload: Record<string, unknown>): SignedPayload;
    verifySignature(signed: SignedPayload): boolean;
    hashPayload(payload: Record<string, unknown>): string;
}
