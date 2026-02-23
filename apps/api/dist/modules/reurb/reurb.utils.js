"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SPREADSHEET_COLUMNS = void 0;
exports.pickValue = pickValue;
exports.toCsv = toCsv;
exports.toXlsx = toXlsx;
exports.buildCartorioZip = buildCartorioZip;
exports.sha256Hex = sha256Hex;
const crypto_1 = require("crypto");
const ExcelJS = require("exceljs");
const JSZip = require("jszip");
exports.DEFAULT_SPREADSHEET_COLUMNS = [
    { key: 'familyCode', label: 'CODIGO_FAMILIA', required: true },
    { key: 'nucleus', label: 'NUCLEO', required: true },
    { key: 'responsibleName', label: 'RESPONSAVEL', required: true },
    { key: 'cpf', label: 'CPF', required: false },
    { key: 'address', label: 'ENDERECO', required: false },
    { key: 'membersCount', label: 'QTDE_MEMBROS', required: true },
    { key: 'monthlyIncome', label: 'RENDA_MENSAL', required: false },
    { key: 'status', label: 'STATUS', required: true },
];
function pickValue(row, key) {
    if (key in row)
        return row[key];
    const data = row.data;
    if (data && typeof data === 'object' && key in data) {
        return data[key];
    }
    return undefined;
}
function toCsv(columns, rows) {
    const escaped = (value) => {
        if (value === null || value === undefined)
            return '';
        const text = String(value).replace(/"/g, '""');
        return /[",\n;]/.test(text) ? `"${text}"` : text;
    };
    const header = columns.map((col) => escaped(col.label)).join(';');
    const lines = rows.map((row) => columns
        .map((col) => escaped(pickValue(row, col.key)))
        .join(';'));
    return [header, ...lines].join('\n');
}
async function toXlsx(columns, rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Planilha Sintese');
    sheet.columns = columns.map((col) => ({
        header: col.label,
        key: col.key,
        width: Math.max(14, col.label.length + 2),
    }));
    rows.forEach((row) => {
        const entry = {};
        columns.forEach((col) => {
            entry[col.key] = pickValue(row, col.key);
        });
        sheet.addRow(entry);
    });
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    return Buffer.from(await workbook.xlsx.writeBuffer());
}
async function buildCartorioZip(params) {
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
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
function sha256Hex(payload) {
    return (0, crypto_1.createHash)('sha256').update(payload).digest('hex');
}
//# sourceMappingURL=reurb.utils.js.map