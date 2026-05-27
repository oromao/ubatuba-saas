import { ReprojectionService } from '../../src/gis/reprojection_service';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

jest.mock('child_process', () => {
  return {
    spawn: jest.fn(() => {
      const events = {
        on: jest.fn((event, cb) => {
          if (event === 'close') {
            // simulate successful exit
            cb(0);
          }
        }),
        stderr: {
          on: jest.fn(),
        },
      } as any;
      return events;
    }),
  };
});

jest.mock('fs');
jest.mock('os');
jest.mock('path');

describe('ReprojectionService', () => {
  const mockTmpDir = '/tmp/reproj-abc123';
  const mockInputPath = `${mockTmpDir}/test.geojson`;
  const mockOutputPath = `${mockTmpDir}/out.geojson`;
  const sampleGeoJson = { type: 'FeatureCollection', features: [] };

  beforeAll(() => {
    // mock fs functions
    (fs.mkdtempSync as jest.Mock).mockReturnValue(mockTmpDir);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleGeoJson));
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
    (fs.rmdirSync as jest.Mock).mockImplementation(() => {});
    // mock path.join to just concatenate with '/'
    (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
    // mock os.tmpdir
    (os.tmpdir as jest.Mock).mockReturnValue('/tmp');
  });

  it('should call ogr2ogr and return parsed GeoJSON', async () => {
    const service = new ReprojectionService();
    const buffer = Buffer.from('dummy');
    const result = await service.reproject(buffer, 'test.geojson', 'EPSG:31983');

    expect(fs.mkdtempSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(mockInputPath, buffer);
    expect(spawn).toHaveBeenCalledWith('ogr2ogr', [
      '-f',
      'GeoJSON',
      '-t_srs',
      'EPSG:31983',
      mockOutputPath,
      mockInputPath,
    ]);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockOutputPath, 'utf-8');
    expect(result).toEqual(sampleGeoJson);
    // ensure cleanup called
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockInputPath);
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockOutputPath);
    expect(fs.rmdirSync).toHaveBeenCalledWith(mockTmpDir);
  });
});
