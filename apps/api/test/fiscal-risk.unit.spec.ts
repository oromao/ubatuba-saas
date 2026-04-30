import { FiscalRiskService } from '../src/common/services/fiscal-risk.service';

describe('FiscalRiskService (T10-FISCAL-IA)', () => {
  const service = new FiscalRiskService();

  describe('calculateRisk', () => {
    it('should return BAIXO for regular parcel with no issues', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'QUITADO',
        statusCadastral: 'ATIVO',
        valorVenalTotal: 200000,
      });
      expect(result.riskLevel).toBe('BAIXO');
      expect(result.score).toBeLessThan(25);
    });

    it('should return CRITICO for parcel with multiple issues', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'INADIMPLENTE',
        workflowStatus: 'CONFLITO',
        areaTerreno: 1000,
        areaCartografica: 500, // 50% discrepancy
      });
      expect(result.riskLevel).toBe('CRITICO');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('should return MEDIO for parcel with IPTU parcelado', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'PARCELADO',
        statusCadastral: 'ATIVO',
      });
      expect(result.riskLevel).toBe('MEDIO');
    });

    it('should score NAO_CADASTRADO IPTU moderately', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'NAO_CADASTRADO',
        statusCadastral: 'ATIVO',
      });
      expect(['BAIXO', 'MEDIO']).toContain(result.riskLevel);
    });

    it('should detect area discrepancies', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'QUITADO',
        statusCadastral: 'ATIVO',
        areaTerreno: 1000,
        areaCartografica: 600, // 40% discrepancy
      });
      expect(result.factors.areaDiscrepancy).toBe(100);
    });

    it('should reduce risk if recently inspected', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'PARCELADO',
        statusCadastral: 'ATIVO',
        lastInspectionDate: new Date().toISOString(), // today
      });
      expect(result.factors.recentInspection).toBe(-20);
    });

    it('should provide recommendation text', () => {
      const result = service.calculateRisk({
        parcelId: 'p1', sqlu: '001',
        statusIPTU: 'INADIMPLENTE',
        workflowStatus: 'CONFLITO',
      });
      expect(result.recommendation.length).toBeGreaterThan(10);
      expect(result.recommendation).toContain('Fiscalizacao');
    });
  });

  describe('rankByRisk', () => {
    it('should sort parcels by risk score descending', () => {
      const parcels = [
        { parcelId: 'p1', sqlu: '001', statusIPTU: 'QUITADO' as const },
        { parcelId: 'p2', sqlu: '002', statusIPTU: 'INADIMPLENTE' as const, workflowStatus: 'CONFLITO' as const },
        { parcelId: 'p3', sqlu: '003', statusIPTU: 'PARCELADO' as const },
      ];
      const ranked = service.rankByRisk(parcels);
      expect(ranked[0].sqlu).toBe('002'); // highest risk
      expect(ranked[ranked.length - 1].sqlu).toBe('001'); // lowest risk
    });
  });
});
