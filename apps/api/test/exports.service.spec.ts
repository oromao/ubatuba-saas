import JSZip = require('jszip');
import { ExportsService } from '../src/exports/exports.service';

describe('ExportsService', () => {
  it('marks georeferenced plant as not implemented instead of faking GeoJSON', async () => {
    const service = new ExportsService();

    const buffer = await service.generateReurbS_Dossier('N1', {
      reqTenant: 'tenant-1',
      actor: 'user-1',
    });

    const zip = await JSZip.loadAsync(buffer);
    const keys = Object.keys(zip.files);

    expect(keys).toContain('Planta_Georreferenciada_NAO_IMPLEMENTADA.txt');
    expect(keys).not.toContain('Planta_Georreferenciada_SIRGAS2000.geojson');

    const placeholder = await zip.file('Planta_Georreferenciada_NAO_IMPLEMENTADA.txt')?.async('string');
    expect(placeholder).toContain('NAO IMPLEMENTADA');
    expect(placeholder).toContain('nucleo_id=N1');
  });
});
