import * as fs from 'fs';
import { Types } from 'mongoose';
import { UploadsRepository } from '../src/modules/uploads/uploads.repository';
import { UploadService } from '../src/modules/uploads/upload.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';

describe('UploadService', () => {
  it('persists uploaded files to object storage and records metadata', async () => {
    const uploadsRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as UploadsRepository;
    const storage = {
      putObject: jest.fn().mockResolvedValue({
        key: 'tenants/tenant-1/uploads/documento.txt',
        bucket: 'flydea-geotiffs',
        url: 'http://minio:9000/flydea-geotiffs/tenants/tenant-1/uploads/documento.txt',
      }),
    } as unknown as ObjectStorageService;
    const service = new UploadService(uploadsRepository, storage);
    const tenantId = new Types.ObjectId().toHexString();

    const url = await service.saveFile({
      originalname: 'documento.txt',
      buffer: Buffer.from('conteudo temporario'),
      size: 19,
      mimetype: 'text/plain',
    } as unknown as Express.Multer.File, tenantId);

    expect(url).toContain('/flydea-geotiffs/tenants/');
    expect(storage.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining(`tenants/${tenantId}/uploads/`),
        content: expect.any(Buffer),
        contentType: 'text/plain',
      }),
    );
    expect(uploadsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: expect.any(Types.ObjectId),
        key: 'tenants/tenant-1/uploads/documento.txt',
        filename: 'documento.txt',
        status: 'UPLOADED',
        size: 19,
        mimeType: 'text/plain',
      }),
    );
  });
});
