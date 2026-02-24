import { createHash } from 'crypto';
import ExcelJS = require('exceljs');
import JSZip = require('jszip');

export type SpreadsheetColumn = { key: string; label: string; required?: boolean };

export const DEFAULT_SPREADSHEET_COLUMNS: SpreadsheetColumn[] = [
  { key: 'familyCode', label: 'CODIGO_FAMILIA', required: true },
  { key: 'nucleus', label: 'NUCLEO', required: true },
  { key: 'responsibleName', label: 'RESPONSAVEL', required: true },
  { key: 'cpf', label: 'CPF', required: false },
  { key: 'address', label: 'ENDERECO', required: false },
  { key: 'membersCount', label: 'QTDE_MEMBROS', required: true },
  { key: 'monthlyIncome', label: 'RENDA_MENSAL', required: false },
  { key: 'status', label: 'STATUS', required: true },
];

export function pickValue(row: Record<string, unknown>, key: string) {
  if (key in row) return row[key];
  const data = row.data;
  if (data && typeof data === 'object' && key in (data as Record<string, unknown>)) {
    return (data as Record<string, unknown>)[key];
  }
  return undefined;
}

export function toCsv(columns: SpreadsheetColumn[], rows: Array<Record<string, unknown>>) {
  const escaped = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const text = String(value).replace(/"/g, '""');
    return /[",\n;]/.test(text) ? `"${text}"` : text;
  };

  const header = columns.map((col) => escaped(col.label)).join(';');
  const lines = rows.map((row) =>
    columns
      .map((col) => escaped(pickValue(row, col.key)))
      .join(';'),
  );

  return [header, ...lines].join('\n');
}

export async function toXlsx(columns: SpreadsheetColumn[], rows: Array<Record<string, unknown>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Planilha Sintese');

  sheet.columns = columns.map((col) => ({
    header: col.label,
    key: col.key,
    width: Math.max(14, col.label.length + 2),
  }));

  rows.forEach((row) => {
    const entry: Record<string, unknown> = {};
    columns.forEach((col) => {
      entry[col.key] = pickValue(row, col.key);
    });
    sheet.addRow(entry);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function buildCartorioZip(params: {
  naming: {
    familyFolder: string;
    spreadsheetFolder: string;
    titlesFolder: string;
    approvedDocumentsFolder: string;
  };
  spreadsheetFileName: string;
  spreadsheetBuffer: Buffer;
  familyRows: Array<Record<string, unknown>>;
  approvedDocuments: Array<{ fileName: string; content: Buffer; nucleus?: string }>;
  extraFiles?: Array<{ path: string; content: Buffer }>;
}) {
  const zip = new JSZip();
  const { naming } = params;

  const families = zip.folder(naming.familyFolder);
  const spreadsheet = zip.folder(naming.spreadsheetFolder);
  const titles = zip.folder(naming.titlesFolder);
  const approved = zip.folder(naming.approvedDocumentsFolder);

  if (!families || !spreadsheet || !titles || !approved) {
    throw new Error('Falha ao estruturar diretorios do pacote cartorio');
  }

  spreadsheet.file(params.spreadsheetFileName, params.spreadsheetBuffer);
  families.file('familias.json', JSON.stringify(params.familyRows, null, 2));

  params.familyRows.forEach((row) => {
    const familyCode = String(row.familyCode ?? 'sem_codigo');
    titles.file(`${familyCode}.txt`, `Titulos relacionados a familia ${familyCode}`);
  });

  params.approvedDocuments.forEach((doc) => {
    const scoped = doc.nucleus ? `${doc.nucleus}/${doc.fileName}` : doc.fileName;
    approved.file(scoped, doc.content);
  });

  (params.extraFiles ?? []).forEach((file) => {
    zip.file(file.path, file.content);
  });

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

export function sha256Hex(payload: Buffer | string) {
  return createHash('sha256').update(payload).digest('hex');
}
