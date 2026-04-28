import { UploadService } from './upload.service';
import { TenantRequest } from '../../common/guards/tenant.guard';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFiles(files: Express.Multer.File[], req: TenantRequest): Promise<{
        urls: string[];
    }>;
}
