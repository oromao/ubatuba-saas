import { PocService } from '../src/modules/poc/poc.service';

describe('poc score', () => {
  const service = new PocService();

  it('retorna 100 quando todos checks passam', () => {
    const result = service.calculateScore([
      { id: 'a', title: 'A', passed: true, weight: 5, evidence: 'a' },
      { id: 'b', title: 'B', passed: true, weight: 5, evidence: 'b' },
    ]);

    expect(result.score).toBe(100);
    expect(result.status).toBe('OK');
  });

  it('retorna status ATENCAO quando abaixo de 95', () => {
    const result = service.calculateScore([
      { id: 'a', title: 'A', passed: true, weight: 5, evidence: 'a' },
      { id: 'b', title: 'B', passed: false, weight: 5, evidence: 'b' },
    ]);

    expect(result.score).toBe(50);
    expect(result.status).toBe('ATENCAO');
  });
});
