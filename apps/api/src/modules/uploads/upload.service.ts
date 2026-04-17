import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { UploadsRepository } from './uploads.repository';
import { asObjectId } from '../../common/utils/object-id';
import { ObjectStorageService } from '../shared/object-storage.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly uploadsRepository: UploadsRepository,
    private readonly storage: ObjectStorageService,
  ) {}

  async saveFile(file: Express.Multer.File, tenantId?: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    
    // Nomenclatura organizada por tenant para evitar colisoes e facilitar auditoria
    const key = tenantId 
      ? `tenants/${tenantId}/uploads/${filename}` 
      : `global/uploads/${filename}`;

    if (!file.buffer) {
      throw new Error('Arquivo sem buffer. Certifique-se de usar memoryStorage no Multer.');
    }

    const uploadResult = await this.storage.putObject({
      key,
      content: file.buffer,
      contentType: file.mimetype,
    });

    if (tenantId) {
      await this.uploadsRepository.create({
        tenantId: asObjectId(tenantId),
        key: uploadResult.key,
        filename: file.originalname,
        status: 'UPLOADED',
        size: file.size,
        mimeType: file.mimetype,
      });
    }

    return uploadResult.url;
  }

  async saveFiles(files: Express.Multer.File[], tenantId?: string): Promise<string[]> {
    return Promise.all(files.map((f) => this.saveFile(f, tenantId)));
  }
}
