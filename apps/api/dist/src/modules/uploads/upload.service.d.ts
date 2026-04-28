import { UploadsRepository } from './uploads.repository';
import { ObjectStorageService } from '../shared/object-storage.service';
export declare class UploadService {
    private readonly uploadsRepository;
    private readonly storage;
    constructor(uploadsRepository: UploadsRepository, storage: ObjectStorageService);
    saveFile(file: Express.Multer.File, tenantId?: string): Promise<string>;
    saveFiles(files: Express.Multer.File[], tenantId?: string): Promise<string[]>;
}
