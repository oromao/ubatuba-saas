import { TaxBillService } from '../src/common/services/tax-bill.service';

describe('TaxBillService (T9-TRIB-CARNE)', () => {
  const service = new TaxBillService();

  describe('generateTaxBill', () => {
    it('should generate a tax bill with 12 installments', () => {
      const bill = service.generateTaxBill({
        parcelId: '507f1f77bcf86cd799439011',
        sqlu: '12345',
        contribuinte: 'JOAO DA SILVA',
        anoExercicio: 2026,
        valorVenalTotal: 200000,
        aliquotaIptu: 0.005,
      });

      expect(bill.iptuTotal).toBe(1000); // 200000 * 0.005
      expect(bill.parcelas).toHaveLength(12);
      expect(bill.parcelas[0].numero).toBe(1);
      expect(bill.parcelas[0].status).toBe('PENDENTE');
      expect(bill.descontoPagamentoUnico).toBe(100); // 10% of 1000
    });

    it('should generate custom number of installments', () => {
      const bill = service.generateTaxBill({
        parcelId: 'p1',
        sqlu: '001',
        contribuinte: 'MARIA',
        anoExercicio: 2026,
        valorVenalTotal: 300000,
        aliquotaIptu: 0.01,
        numeroParcelas: 6,
      });

      expect(bill.iptuTotal).toBe(3000);
      expect(bill.parcelas).toHaveLength(6);
    });

    it('should have correct installment dates (day 15 of each month)', () => {
      const bill = service.generateTaxBill({
        parcelId: 'p1', sqlu: '001', contribuinte: 'X',
        anoExercicio: 2026, valorVenalTotal: 100000, aliquotaIptu: 0.005,
        numeroParcelas: 3,
      });

      expect(bill.parcelas[0].vencimento).toBe('2026-01-15');
      expect(bill.parcelas[1].vencimento).toBe('2026-02-15');
      expect(bill.parcelas[2].vencimento).toBe('2026-03-15');
    });
  });

  describe('calculateCollectionSummary', () => {
    it('should summarize multiple tax bills', () => {
      const bills = [
        service.generateTaxBill({ parcelId: 'p1', sqlu: '001', contribuinte: 'A', anoExercicio: 2026, valorVenalTotal: 200000, aliquotaIptu: 0.005 }),
        service.generateTaxBill({ parcelId: 'p2', sqlu: '002', contribuinte: 'B', anoExercicio: 2026, valorVenalTotal: 300000, aliquotaIptu: 0.005 }),
      ];

      const summary = service.calculateCollectionSummary(bills);
      expect(summary.totalLancado).toBe(2500); // 1000 + 1500
      expect(summary.totalParcelas).toBe(24); // 12 + 12
      expect(summary.mediaValorVenal).toBe(250000);
    });

    it('should handle empty bills', () => {
      const summary = service.calculateCollectionSummary([]);
      expect(summary.totalLancado).toBe(0);
      expect(summary.mediaValorVenal).toBe(0);
    });
  });

  describe('getDefaultParcelas', () => {
    it('should return 6 for IPTU < 100', () => {
      expect(service.getDefaultParcelas(50)).toBe(6);
    });

    it('should return 8 for IPTU 100-499', () => {
      expect(service.getDefaultParcelas(250)).toBe(8);
    });

    it('should return 10 for IPTU 500-999', () => {
      expect(service.getDefaultParcelas(750)).toBe(10);
    });

    it('should return 12 for IPTU >= 1000', () => {
      expect(service.getDefaultParcelas(1500)).toBe(12);
    });
  });
});
