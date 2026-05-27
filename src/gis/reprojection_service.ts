// src/gis/reprojection_service.ts
/**
 * Geo‑Reprojection Service
 *
 * Exposes a simple HTTP endpoint (NestJS style) that receives a file (shapefile zip or GeoJSON)
 * and returns the reprojected GeoJSON according to the CRS requested by the client.
 *
 * This implementation re‑uses the `runOgr2ogr` helper from `import_module.ts`.
 */

import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class ReprojectionService {
  /**
   * Reproject the uploaded file to the target CRS.
   * @param fileBuffer Buffer of the uploaded file
   * * @param originalName Original filename (used for temp file name)
   * @param targetCrs EPSG code, e.g., 'EPSG:31982'
   */
  async reproject(fileBuffer: Buffer, originalName: string, targetCrs: string): Promise<any> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reproj-'));
    const inputPath = path.join(tmpDir, originalName);
    const outputPath = path.join(tmpDir, 'out.geojson');
    fs.writeFileSync(inputPath, fileBuffer);

    await this.runOgr2ogr(inputPath, outputPath, targetCrs);
    const geojson = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    // Cleanup
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
    try { fs.rmdirSync(tmpDir); } catch {}
    return geojson;
  }

  private runOgr2ogr(inputPath: string, outputPath: string, targetCrs: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['-f', 'GeoJSON', '-t_srs', targetCrs, outputPath, inputPath];
      const proc = spawn('ogr2ogr', args);
      let stderr = '';
      proc.stderr.on('data', (data) => (stderr += data.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ogr2ogr failed (code ${code}): ${stderr}`));
      });
    });
  }
}

export default ReprojectionService;
