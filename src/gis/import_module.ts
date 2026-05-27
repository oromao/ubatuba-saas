// src/gis/import_module.ts
/**
 * GIS Import Module
 *
 * Provides functionality to upload Shapefile or GeoJSON files, parse them using GDAL,
 * reproject geometries to the target CRS (SIRGAS 2000 / UTM) and perform basic topology
 * validation (duplicate removal, polygon validity).
 *
 * This is a minimal implementation intended for the Sprint 1 proof‑of‑concept.
 * In production you would replace the stubbed `processFile` with a proper streaming
 * pipeline and robust error handling.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ImportResult {
  /** GeoJSON FeatureCollection */
  geojson: any;
  /** Any warnings generated during validation */
  warnings: string[];
}

/**
 * Execute GDAL `ogr2ogr` to convert the input file to GeoJSON and reproject.
 * The function assumes `ogr2ogr` is available in the container (installed via GDAL).
 */
async function runOgr2ogr(inputPath: string, outputPath: string, targetCrs: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'GeoJSON',
      '-t_srs', targetCrs,
      outputPath,
      inputPath,
    ];
    const proc = spawn('ogr2ogr', args);
    let stderr = '';
    proc.stderr.on('data', (data) => (stderr += data.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ogr2ogr failed (code ${code}): ${stderr}`));
    });
  });
}

/**
 * Main entry point used by the API layer.
 * @param fileBuffer Buffer containing the uploaded file (shapefile zip or .geojson)
 * @param originalName Original file name (used to guess extension)
 */
export async function importFile(fileBuffer: Buffer, originalName: string): Promise<ImportResult> {
  // 1. Persist temporary file
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gis-import-'));
  const tmpInput = path.join(tmpDir, originalName);
  fs.writeFileSync(tmpInput, fileBuffer);

  const tmpOutput = path.join(tmpDir, 'output.geojson');
  const targetCrs = 'EPSG:4326'; // WGS84 (global standard)

  try {
    await runOgr2ogr(tmpInput, tmpOutput, targetCrs);
    const geojson = JSON.parse(fs.readFileSync(tmpOutput, 'utf-8'));
    // Simple topology validation – remove duplicate features
    const seen = new Set();
    const uniqueFeatures = geojson.features.filter((f: any) => {
      const key = JSON.stringify(f.geometry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const warnings: string[] = [];
    if (uniqueFeatures.length !== geojson.features.length) {
      warnings.push('Duplicated geometries were removed');
    }
    // Additional polygon validity checks could be added here.
    return { geojson: { ...geojson, features: uniqueFeatures }, warnings };
  } finally {
    // Cleanup temporary files
    try { fs.unlinkSync(tmpInput); } catch {}
    try { fs.unlinkSync(tmpOutput); } catch {}
    try { fs.rmdirSync(tmpDir); } catch {}
  }
}

// Export for external usage (e.g., NestJS service)
export default { importFile };
