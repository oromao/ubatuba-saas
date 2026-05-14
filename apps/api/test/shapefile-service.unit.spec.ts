import { ShapefileService } from '../src/modules/ctm/parcels/shapefile.service';

describe('ShapefileService', () => {
  let service: ShapefileService;

  beforeEach(() => {
    service = new ShapefileService();
  });

  describe('parse', () => {
    it('should reject non-shp/non-zip files', async () => {
      await expect(service.parse(Buffer.from(''), 'test.txt')).rejects.toThrow(
        'Formato não suportado',
      );
    });

    it('should reject unsupported format without extension', async () => {
      await expect(service.parse(Buffer.from(''), 'data')).rejects.toThrow(
        'Formato não suportado',
      );
    });

    it('should reject empty buffer for .shp', async () => {
      await expect(service.parse(Buffer.from(''), 'test.shp')).rejects.toThrow();
    });

    it('should reject .zip without .shp inside', async () => {
      const JSZip = require('jszip');
      const zip = new JSZip();
      zip.file('readme.txt', 'no shapefiles here');
      const buf = await zip.generateAsync({ type: 'nodebuffer' });

      await expect(service.parse(Buffer.from(buf), 'archive.zip')).rejects.toThrow(
        '.shp não encontrado',
      );
    });

    it('should reject .zip with empty .shp', async () => {
      const JSZip = require('jszip');
      const zip = new JSZip();
      zip.file('test.shp', Buffer.from([0, 0, 0, 0]));
      const buf = await zip.generateAsync({ type: 'nodebuffer' });

      await expect(service.parse(Buffer.from(buf), 'archive.zip')).rejects.toThrow();
    });
  });
});
