"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const upload_service_1 = require("../src/modules/uploads/upload.service");
describe('UploadService', () => {
    it('persists uploaded files to object storage and records metadata', async () => {
        const uploadsRepository = {
            create: jest.fn().mockResolvedValue(undefined),
        };
        const storage = {
            putObject: jest.fn().mockResolvedValue({
                key: 'tenants/tenant-1/uploads/documento.txt',
                bucket: 'flydea-geotiffs',
                url: 'http://minio:9000/flydea-geotiffs/tenants/tenant-1/uploads/documento.txt',
            }),
        };
        const service = new upload_service_1.UploadService(uploadsRepository, storage);
        const tenantId = new mongoose_1.Types.ObjectId().toHexString();
        const url = await service.saveFile({
            originalname: 'documento.txt',
            buffer: Buffer.from('conteudo temporario'),
            size: 19,
            mimetype: 'text/plain',
        }, tenantId);
        expect(url).toContain('/flydea-geotiffs/tenants/');
        expect(storage.putObject).toHaveBeenCalledWith(expect.objectContaining({
            key: expect.stringContaining(`tenants/${tenantId}/uploads/`),
            content: expect.any(Buffer),
            contentType: 'text/plain',
        }));
        expect(uploadsRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            tenantId: expect.any(mongoose_1.Types.ObjectId),
            key: 'tenants/tenant-1/uploads/documento.txt',
            filename: 'documento.txt',
            status: 'UPLOADED',
            size: 19,
            mimeType: 'text/plain',
        }));
    });
});
//# sourceMappingURL=uploads.service.spec.js.map