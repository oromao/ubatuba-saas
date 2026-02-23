"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
exports.buildSimplePdf = buildSimplePdf;
const escapePdfText = (text) => text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, '\\n');
function renderTemplate(html, variables) {
    return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
        const value = variables[key];
        return value === undefined || value === null ? '' : String(value);
    });
}
function buildSimplePdf(content) {
    const safeContent = escapePdfText(content);
    const objects = [
        '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
        '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
        '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
        `4 0 obj << /Length ${safeContent.length + 45} >> stream\nBT /F1 12 Tf 40 800 Td (${safeContent}) Tj ET\nendstream endobj`,
        '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    ];
    let body = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((obj) => {
        offsets.push(body.length);
        body += `${obj}\n`;
    });
    const xrefPosition = body.length;
    body += `xref\n0 ${objects.length + 1}\n`;
    body += '0000000000 65535 f \n';
    offsets.forEach((offset) => {
        body += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;
    return Buffer.from(body, 'utf-8');
}
//# sourceMappingURL=pdf.util.js.map