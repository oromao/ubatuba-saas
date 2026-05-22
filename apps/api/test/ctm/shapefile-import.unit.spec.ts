// apps/api/test/ctm/shapefile-import.unit.spec.ts
/**
 * Testes unitários do ShapefileImportService
 * Não requerem banco de dados nem MongoDB.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ShapefileImportService } from '../../src/modules/ctm/parcels/shapefile-import.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as JSZip from 'jszip';

describe('ShapefileImportService (unit)', () => {
  let service: ShapefileImportService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShapefileImportService],
    }).compile();

    service = module.get<ShapefileImportService>(ShapefileImportService);
  });

  // Caminho do fixture gerado por generate-shp-fixture.mjs
  const fixturePath = join(__dirname, 'fixtures', 'shp-ubatuba-test.zip');

  // -------------------------------------------------------
  // Cenário 1: ZIP válido → FeatureCollection com features
  // -------------------------------------------------------
  it('deve retornar FeatureCollection com features a partir de ZIP válido', async () => {
    const buffer = readFileSync(fixturePath);

    const result = await service.parseShpZip(buffer);

    expect(result.featureCollection.type).toBe('FeatureCollection');
    expect(result.featureCollection.features.length).toBeGreaterThanOrEqual(1);
    expect(result.totalFeatures).toBeGreaterThanOrEqual(1);
    expect(result.detectedCrs).toBe('EPSG:4326'); // WGS84 via .prj

    // Verificar que as coordenadas são WGS84 (Brasil)
    const firstGeom = result.featureCollection.features[0].geometry as any;
    expect(firstGeom.type).toBe('Polygon');
    const firstCoord = firstGeom.coordinates[0][0];
    expect(firstCoord[0]).toBeGreaterThan(-80);
    expect(firstCoord[0]).toBeLessThan(-30);
  });

  // -------------------------------------------------------
  // Cenário 2: ZIP sem .shp → BadRequestException
  // -------------------------------------------------------
  it('deve lançar BadRequestException quando ZIP não contém .shp', async () => {
    const zip = new JSZip();
    zip.file('apenas-texto.txt', 'sem shapefile aqui');
    const buffer = Buffer.from(
      await zip.generateAsync({ type: 'nodebuffer' })
    );

    await expect(service.parseShpZip(buffer)).rejects.toThrow(BadRequestException);
    await expect(service.parseShpZip(buffer)).rejects.toThrow(
      /\.shp não encontrado/i,
    );
  });

  // -------------------------------------------------------
  // Cenário 3: Buffer inválido (não é ZIP) → BadRequestException
  // -------------------------------------------------------
  it('deve lançar BadRequestException quando buffer não é um ZIP válido', async () => {
    const buffer = Buffer.from('isto nao e um zip valido!!!', 'utf-8');

    await expect(service.parseShpZip(buffer)).rejects.toThrow(BadRequestException);
    await expect(service.parseShpZip(buffer)).rejects.toThrow(
      /não é um ZIP válido/i,
    );
  });

  // -------------------------------------------------------
  // Cenário 4: ZIP com .shp mas sem .prj → warning + assume WGS84
  // -------------------------------------------------------
  it('deve processar ZIP sem .prj e adicionar warning de CRS assumido', async () => {
    // Reusa o fixture mas remove o .prj
    const originalZip = await JSZip.loadAsync(readFileSync(fixturePath));

    const zip2 = new JSZip();
    for (const [name, file] of Object.entries(originalZip.files)) {
      if (!name.toLowerCase().endsWith('.prj') && !file.dir) {
        const content = await file.async('nodebuffer');
        zip2.file(name, content);
      }
    }
    const buffer = Buffer.from(await zip2.generateAsync({ type: 'nodebuffer' }));

    const result = await service.parseShpZip(buffer);

    // Deve ter processado sem explodir
    expect(result.featureCollection.type).toBe('FeatureCollection');
    // Deve ter um warning sobre CRS
    expect(result.warnings.some((w) => /wgs84|crs/i.test(w))).toBe(true);
  });
});
