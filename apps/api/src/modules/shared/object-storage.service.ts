import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class ObjectStorageService {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicEndpoint: string;
  private readonly client: S3Client;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
    this.publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT ?? this.endpoint;
    this.bucket = process.env.MINIO_BUCKET ?? 'flydea-geotiffs';

    this.client = new S3Client({
      region: process.env.MINIO_REGION ?? 'us-east-1',
      endpoint: this.endpoint,
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

  private async toBuffer(stream: unknown): Promise<Buffer> {
    if (!stream) return Buffer.alloc(0);
    if (Buffer.isBuffer(stream)) return stream;
    if (stream instanceof Uint8Array) return Buffer.from(stream);
    if (!(stream instanceof Readable)) {
      return Buffer.alloc(0);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return;
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async createPresignedUpload(params: {
    key: string;
    contentType?: string;
    expiresInSeconds?: number;
  }) {
    await this.ensureBucket();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType ?? 'application/octet-stream',
    });
    const expiresIn = params.expiresInSeconds ?? 900;
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return {
      method: 'PUT' as const,
      url,
      headers: {
        'Content-Type': params.contentType ?? 'application/octet-stream',
      },
      key: params.key,
      bucket: this.bucket,
      expiresIn,
    };
  }

  async createPresignedDownload(params: { key: string; expiresInSeconds?: number }) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: params.key });
    const expiresIn = params.expiresInSeconds ?? 900;
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return {
      method: 'GET' as const,
      url,
      key: params.key,
      bucket: this.bucket,
      expiresIn,
    };
  }

  async putObject(params: { key: string; content: Buffer | string; contentType?: string }) {
    await this.ensureBucket();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.content,
        ContentType: params.contentType ?? 'application/octet-stream',
      }),
    );
    return {
      key: params.key,
      bucket: this.bucket,
      url: `${this.publicEndpoint.replace(/\/$/, '')}/${this.bucket}/${params.key}`,
    };
  }

  async getObjectBuffer(key: string) {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bodyBuffer = await this.toBuffer(result.Body);
    return {
      key,
      buffer: bodyBuffer,
      contentType: result.ContentType ?? 'application/octet-stream',
      contentLength: result.ContentLength ?? bodyBuffer.length,
    };
  }
}

