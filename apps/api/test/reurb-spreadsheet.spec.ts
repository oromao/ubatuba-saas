import ExcelJS = require('exceljs');
import { DEFAULT_SPREADSHEET_COLUMNS, toXlsx } from '../src/modules/reurb/reurb.utils';

describe('reurb spreadsheet generation', () => {
  it('keeps configured column order and labels', async () => {
    const rows = [
      {
        familyCode: 'FAM-001',
        nucleus: 'N1',
        responsibleName: 'Maria',
        status: 'APTA',
      },
    ];

    const buffer = await toXlsx(DEFAULT_SPREADSHEET_COLUMNS, rows);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Planilha Sintese');

    expect(sheet).toBeDefined();

    const headers = sheet!.getRow(1).values as Array<string | undefined>;
    const nonEmptyHeaders = headers.filter((value) => typeof value === 'string');
    expect(nonEmptyHeaders).toEqual(DEFAULT_SPREADSHEET_COLUMNS.map((col) => col.label));

    const row2 = sheet!.getRow(2).values as Array<string | undefined>;
    expect(row2).toContain('FAM-001');
    expect(row2).toContain('Maria');
  });
});
