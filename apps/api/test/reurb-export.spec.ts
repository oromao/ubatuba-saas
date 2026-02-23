import { DEFAULT_SPREADSHEET_COLUMNS, toCsv } from '../src/modules/reurb/reurb.utils';

describe('reurb tabular export', () => {
  it('exports csv with configured headers and tenant rows', () => {
    const rows = [
      {
        familyCode: 'FAM-001',
        nucleus: 'Nucleo Azul',
        responsibleName: 'Joao da Silva',
        cpf: '12345678900',
        address: 'Rua A, 10',
        membersCount: 4,
        monthlyIncome: 1800,
        status: 'APTA',
      },
    ];

    const csv = toCsv(DEFAULT_SPREADSHEET_COLUMNS, rows);
    expect(csv).toContain('CODIGO_FAMILIA');
    expect(csv).toContain('Nucleo Azul');
    expect(csv).toContain('Joao da Silva');
    expect(csv).toContain('APTA');
  });
});
