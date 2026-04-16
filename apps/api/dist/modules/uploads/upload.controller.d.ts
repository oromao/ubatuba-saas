import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFiles(files: Express.Multer.File[], _req: unknown): Promise<{
        urls: string[];
    }>;
}
