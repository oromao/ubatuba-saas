export declare class ObjectStorageService {
    private readonly bucket;
    private readonly endpoint;
    private readonly publicEndpoint;
    private readonly client;
    private readonly publicClient;
    constructor();
    getBucket(): string;
    private toBuffer;
    ensureBucket(): Promise<void>;
    createPresignedUpload(params: {
        key: string;
        contentType?: string;
        expiresInSeconds?: number;
    }): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    createPresignedDownload(params: {
        key: string;
        expiresInSeconds?: number;
    }): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    putObject(params: {
        key: string;
        content: Buffer | string;
        contentType?: string;
    }): Promise<{
        key: string;
        bucket: string;
        url: string;
    }>;
    getObjectBuffer(key: string): Promise<{
        key: string;
        buffer: Buffer<ArrayBufferLike>;
        contentType: string;
        contentLength: number;
    }>;
}
