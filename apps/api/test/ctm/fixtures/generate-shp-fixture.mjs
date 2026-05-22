/**
 * Script para gerar um ZIP de Shapefile de teste (fixture).
 * Executa via: node apps/api/test/ctm/fixtures/generate-shp-fixture.mjs
 */

import JSZip from 'jszip';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// =========================================================
// 1. .shp mínimo com 1 Polygon (ESRI Shapefile binary)
// =========================================================
// Polygon em Ubatuba (WGS84)
const coords = [
  [-45.070, -23.430],
  [-45.060, -23.430],
  [-45.060, -23.440],
  [-45.070, -23.440],
  [-45.070, -23.430],
];

const shapeType = 5; // Polygon
const numParts = 1;
const numPoints = coords.length;

const minX = Math.min(...coords.map(c => c[0]));
const minY = Math.min(...coords.map(c => c[1]));
const maxX = Math.max(...coords.map(c => c[0]));
const maxY = Math.max(...coords.map(c => c[1]));

// Content length in 16-bit words:
// shapeType(4) + bbox(32) + numParts(4) + numPoints(4) + parts(4*numParts) + points(16*numPoints)
const contentBytes = 4 + 32 + 4 + 4 + 4 * numParts + 16 * numPoints;
const contentWords = contentBytes / 2;
const fileWords = 50 + 4 + contentWords; // header(50) + recordHeader(4) + content

const shp = Buffer.alloc(fileWords * 2, 0);

// --- Header (100 bytes) ---
shp.writeInt32BE(9994, 0);       // File code
shp.writeInt32BE(fileWords, 24); // File length (words)
shp.writeInt32LE(1000, 28);      // Version
shp.writeInt32LE(shapeType, 32); // Shape type
// Bounding box
shp.writeDoubleLEFloat64 = (v, o) => shp.writeDoubleLEFloat64; // placeholder
shp.writeDoubleLE(minX, 36);
shp.writeDoubleLE(minY, 44);
shp.writeDoubleLE(maxX, 52);
shp.writeDoubleLE(maxY, 60);
// Z/M ranges (zeros already)

// --- Record header (8 bytes) at offset 100 ---
shp.writeInt32BE(1, 100);             // Record number
shp.writeInt32BE(contentWords, 104);  // Content length (words)

// --- Record content at offset 108 ---
let pos = 108;
shp.writeInt32LE(shapeType, pos); pos += 4;
shp.writeDoubleLE(minX, pos); pos += 8;
shp.writeDoubleLE(minY, pos); pos += 8;
shp.writeDoubleLE(maxX, pos); pos += 8;
shp.writeDoubleLE(maxY, pos); pos += 8;
shp.writeInt32LE(numParts, pos); pos += 4;
shp.writeInt32LE(numPoints, pos); pos += 4;
shp.writeInt32LE(0, pos); pos += 4; // part 0 starts at index 0
for (const [x, y] of coords) {
  shp.writeDoubleLE(x, pos); pos += 8;
  shp.writeDoubleLE(y, pos); pos += 8;
}

// =========================================================
// 2. .dbf mínimo (dBASE III) com campo SQLU
// =========================================================
const fieldLength = 14;
const dbfHeaderSize = 32 + 32 + 1;
const dbfRecordSize = 1 + fieldLength;

const dbf = Buffer.alloc(dbfHeaderSize + dbfRecordSize, 0);
dbf[0] = 0x03;                         // dBASE III
dbf[1] = 26; dbf[2] = 5; dbf[3] = 22; // Date
dbf.writeUInt32LE(1, 4);               // Num records
dbf.writeUInt16LE(dbfHeaderSize, 8);   // Header size
dbf.writeUInt16LE(dbfRecordSize, 10);  // Record size

// Field descriptor at offset 32
const name = 'SQLU';
dbf.write(name.padEnd(11, '\0'), 32, 'ascii');
dbf[43] = 0x43;        // 'C' = Character
dbf[48] = fieldLength; // Field length

dbf[64] = 0x0D; // Header terminator

// Record at offset 65
dbf[65] = 0x20; // not deleted
dbf.write('SHP-UBATUBA-001'.padEnd(fieldLength).slice(0, fieldLength), 66, 'ascii');

// =========================================================
// 3. .prj (WGS84 WKT)
// =========================================================
const prj = `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`;

// =========================================================
// 4. Montar ZIP
// =========================================================
const zip = new JSZip();
zip.file('test_parcelas.shp', shp);
zip.file('test_parcelas.dbf', dbf);
zip.file('test_parcelas.prj', prj);

const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

const outPath = join(__dirname, 'shp-ubatuba-test.zip');
await writeFile(outPath, zipBuf);

console.log(`ZIP gerado: ${outPath} (${zipBuf.length} bytes)`);
