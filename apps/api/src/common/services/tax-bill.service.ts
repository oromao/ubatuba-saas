import { Injectable } from '@nestjs/common';

export interface TaxBillInstallment {
  numero: number;
  vencimento: string;
  valor: number;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

export interface TaxBill {
  id: string;
  parcelId: string;
  sqlu: string;
  contribuinte: string;
  anoExercicio: number;
  valorVenalTotal: number;
  aliquotaIptu: number;
  iptuTotal: number;
  parcelas: TaxBillInstallment[];
  descontoPagamentoUnico?: number;
}

@Injectable()
export class TaxBillService {
  /**
   * Generate an IPTU tax bill (carnê) with installment options.
   */
  generateTaxBill(params: {
    parcelId: string;
    sqlu: string;
    contribuinte: string;
    anoExercicio: number;
    valorVenalTotal: number;
    aliquotaIptu: number;
    numeroParcelas?: number;
  }): TaxBill {
    const numeroParcelas = params.numeroParcelas || 12;
    const iptuTotal = Math.round(params.valorVenalTotal * params.aliquotaIptu * 100) / 100;
    const valorParcela = Math.round((iptuTotal / numeroParcelas) * 100) / 100;
    const descontoUnico = Math.round(iptuTotal * 0.1 * 100) / 100; // 10% discount for single payment

    const parcelas: TaxBillInstallment[] = [];
    for (let i = 0; i < numeroParcelas; i++) {
      const vencimento = new Date(params.anoExercicio, i, 15);
      parcelas.push({
        numero: i + 1,
        vencimento: vencimento.toISOString().slice(0, 10),
        valor: valorParcela,
        status: 'PENDENTE',
      });
    }

    return {
      id: `IPTU-${params.anoExercicio}-${params.parcelId.slice(-6)}`,
      parcelId: params.parcelId,
      sqlu: params.sqlu,
      contribuinte: params.contribuinte,
      anoExercicio: params.anoExercicio,
      valorVenalTotal: params.valorVenalTotal,
      aliquotaIptu: params.aliquotaIptu,
      iptuTotal,
      parcelas,
      descontoPagamentoUnico: descontoUnico,
    };
  }

  /**
   * Calculate IPTU collection summary for a set of bills.
   */
  calculateCollectionSummary(bills: TaxBill[]): {
    totalLancado: number;
    totalParcelas: number;
    mediaValorVenal: number;
    inadimplenciaEstimada?: number;
  } {
    const totalLancado = bills.reduce((sum, b) => sum + b.iptuTotal, 0);
    const totalParcelas = bills.reduce((sum, b) => sum + b.parcelas.length, 0);
    const mediaValorVenal = bills.length > 0
      ? bills.reduce((sum, b) => sum + b.valorVenalTotal, 0) / bills.length
      : 0;

    return {
      totalLancado: Math.round(totalLancado * 100) / 100,
      totalParcelas,
      mediaValorVenal: Math.round(mediaValorVenal * 100) / 100,
    };
  }

  /**
   * Calculate default installment count based on IPTU value.
   * Brazilian legislation typically allows up to 10-12 installments.
   */
  getDefaultParcelas(iptuTotal: number): number {
    if (iptuTotal < 100) return 6;
    if (iptuTotal < 500) return 8;
    if (iptuTotal < 1000) return 10;
    return 12;
  }
}
