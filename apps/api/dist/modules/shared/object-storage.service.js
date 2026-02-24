"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
let ObjectStorageService = class ObjectStorageService {
    constructor() {
        this.endpoint = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
        this.publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT ?? this.endpoint;
        this.bucket = process.env.MINIO_BUCKET ?? 'flydea-geotiffs';
        this.client = new client_s3_1.S3Client({
            region: process.env.MINIO_REGION ?? 'us-east-1',
            endpoint: this.endpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
                secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
            },
        });
        this.publicClient = new client_s3_1.S3Client({
            region: process.env.MINIO_REGION ?? 'us-east-1',
            endpoint: this.publicEndpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
                secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
            },
        });
    }
    getBucket() {
        return this.bucket;
    }
    async toBuffer(stream) {
        if (!stream)
            return Buffer.alloc(0);
        if (Buffer.isBuffer(stream))
            return stream;
        if (stream instanceof Uint8Array)
            return Buffer.from(stream);
        if (!(stream instanceof stream_1.Readable)) {
            return Buffer.alloc(0);
        }
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
    async ensureBucket() {
        try {
            await this.client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
            return;
        }
        catch {
            await this.client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
        }
    }
    async createPresignedUpload(params) {
        await this.ensureBucket();
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: params.key,
            ContentType: params.contentType ?? 'application/octet-stream',
        });
        const expiresIn = params.expiresInSeconds ?? 900;
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.publicClient, command, { expiresIn });
        return {
            method: 'PUT',
            url,
            headers: {
                'Content-Type': params.contentType ?? 'application/octet-stream',
            },
            key: params.key,
            bucket: this.bucket,
            expiresIn,
        };
    }
    async createPresignedDownload(params) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: params.key });
        const expiresIn = params.expiresInSeconds ?? 900;
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.publicClient, command, { expiresIn });
        return {
            method: 'GET',
            url,
            key: params.key,
            bucket: this.bucket,
            expiresIn,
        };
    }
    async putObject(params) {
        await this.ensureBucket();
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: params.key,
            Body: params.content,
            ContentType: params.contentType ?? 'application/octet-stream',
        }));
        return {
            key: params.key,
            bucket: this.bucket,
            url: `${this.publicEndpoint.replace(/\/$/, '')}/${this.bucket}/${params.key}`,
        };
    }
    async getObjectBuffer(key) {
        const result = await this.client.send(new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key }));
        const bodyBuffer = await this.toBuffer(result.Body);
        return {
            key,
            buffer: bodyBuffer,
            contentType: result.ContentType ?? 'application/octet-stream',
            contentLength: result.ContentLength ?? bodyBuffer.length,
        };
    }
};
exports.ObjectStorageService = ObjectStorageService;
exports.ObjectStorageService = ObjectStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ObjectStorageService);
//# sourceMappingURL=object-storage.service.js.map