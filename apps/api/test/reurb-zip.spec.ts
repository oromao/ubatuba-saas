import JSZip = require('jszip');
import { buildCartorioZip, sha256Hex } from '../src/modules/reurb/reurb.utils';

describe('reurb cartorio zip', () => {
  it('creates required folders and integrity hash', async () => {
    const buffer = await buildCartorioZip({
      naming: {
        familyFolder: 'familias',
        spreadsheetFolder: 'planilha',
        titlesFolder: 'titulos',
        approvedDocumentsFolder: 'documentos_aprovados',
      },
      spreadsheetFileName: 'planilha_sintese.xlsx',
      spreadsheetBuffer: Buffer.from('fake-xlsx'),
      familyRows: [{ familyCode: 'FAM-001' }],
      approvedDocuments: [{ fileName: 'rg.pdf', content: Buffer.from('doc'), nucleus: 'N1' }],
    });

    const hash = sha256Hex(buffer);
    expect(hash).toHaveLength(64);

    const zip = await JSZip.loadAsync(buffer);
    const keys = Object.keys(zip.files);

    expect(keys).toContain('familias/familias.json');
    expect(keys).toContain('planilha/planilha_sintese.xlsx');
    expect(keys).toContain('titulos/FAM-001.txt');
    expect(keys).toContain('documentos_aprovados/N1/rg.pdf');
  });
});
