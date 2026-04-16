import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const filePath = join(this.uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${filename}`;
  }

  async saveFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((f) => this.saveFile(f)));
  }
}
