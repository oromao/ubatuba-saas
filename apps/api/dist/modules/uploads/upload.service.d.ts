export declare class UploadService {
    private readonly uploadDir;
    constructor();
    saveFile(file: Express.Multer.File): Promise<string>;
    saveFiles(files: Express.Multer.File[]): Promise<string[]>;
}
