import { buildSimplePdf, renderTemplate } from '../src/modules/notifications-letters/pdf.util';

describe('pdf util', () => {
  it('renderTemplate substitui variaveis em html', () => {
    const rendered = renderTemplate('<h1>{{title}}</h1><p>{{count}}</p>', {
      title: 'Carta',
      count: 12,
    });

    expect(rendered).toBe('<h1>Carta</h1><p>12</p>');
  });

  it('buildSimplePdf gera buffer PDF valido', () => {
    const buffer = buildSimplePdf('Teste de notificacao');
    const raw = buffer.toString('utf-8');

    expect(buffer.length).toBeGreaterThan(50);
    expect(raw.startsWith('%PDF-1.4')).toBe(true);
    expect(raw.includes('%%EOF')).toBe(true);
  });
});
