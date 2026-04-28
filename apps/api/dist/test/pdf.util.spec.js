"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_util_1 = require("../src/modules/notifications-letters/pdf.util");
describe('pdf util', () => {
    it('renderTemplate substitui variaveis em html', () => {
        const rendered = (0, pdf_util_1.renderTemplate)('<h1>{{title}}</h1><p>{{count}}</p>', {
            title: 'Carta',
            count: 12,
        });
        expect(rendered).toBe('<h1>Carta</h1><p>12</p>');
    });
    it('buildSimplePdf gera buffer PDF valido', () => {
        const buffer = (0, pdf_util_1.buildSimplePdf)('Teste de notificacao');
        const raw = buffer.toString('utf-8');
        expect(buffer.length).toBeGreaterThan(50);
        expect(raw.startsWith('%PDF-1.4')).toBe(true);
        expect(raw.includes('%%EOF')).toBe(true);
    });
});
//# sourceMappingURL=pdf.util.spec.js.map