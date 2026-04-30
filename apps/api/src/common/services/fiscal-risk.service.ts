import { Injectable } from '@nestjs/common';

export interface FiscalRiskScore {
  parcelId: string;
  sqlu: string;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  score: number; // 0-100
  factors: {
    iptuStatus: number;       // 0=quitado, 50=parcelado, 100=inadimplente
    noValuation: number;      // 100 if no PGV valuation exists
    conflictStatus: number;   // 100 if CONFLITO or REPROVADA
    recentInspection: number; // -20 if inspected in last 6 months
    areaDiscrepancy: number;  // 100 if area differs significantly
    zoneChange: number;       // 30 if zone changed recently
  };
  recommendation: string;
}

@Injectable()
export class FiscalRiskService {
  /**
   * Calculate a fiscal risk score (0-100) for a parcel.
   * Used to prioritize fiscalization efforts.
   * Rule-based heuristic (not ML).
   */
  calculateRisk(params: {
    parcelId: string;
    sqlu: string;
    statusIPTU?: string;
    valorVenalTotal?: number;
    valuationTotalValue?: number;
    statusCadastral?: string;
    workflowStatus?: string;
    lastInspectionDate?: string;
    areaTerreno?: number;
    areaCartografica?: number;
    zoneamento?: string;
    zoneUpdatedAt?: string;
    iptuLancado?: number;
    iptuPago?: number;
  }): FiscalRiskScore {
    let score = 0;
    const factors: FiscalRiskScore['factors'] = {
      iptuStatus: 0,
      noValuation: 0,
      conflictStatus: 0,
      recentInspection: 0,
      areaDiscrepancy: 0,
      zoneChange: 0,
    };

    // 1. IPTU status (0-100)
    const iptuStatus = (params.statusIPTU || 'NAO_CADASTRADO').toUpperCase();
    if (iptuStatus === 'INADIMPLENTE') { factors.iptuStatus = 100; score += 100; }
    else if (iptuStatus === 'PARCELADO') { factors.iptuStatus = 50; score += 50; }
    else if (iptuStatus === 'ISENTO' || iptuStatus === 'QUITADO') { factors.iptuStatus = 0; }
    else if (iptuStatus === 'NAO_CADASTRADO') { factors.iptuStatus = 30; score += 30; }

    // 2. No valuation (0-100)
    if (!params.valuationTotalValue && !params.valorVenalTotal) {
      factors.noValuation = 100;
      score += 100;
    }

    // 3. Conflict status (0-100)
    const status = (params.workflowStatus || params.statusCadastral || '').toUpperCase();
    if (status === 'CONFLITO' || status === 'REPROVADA') {
      factors.conflictStatus = 100;
      score += 100;
    }

    // 4. Recent inspection (-20 if inspected in last 6 months)
    if (params.lastInspectionDate) {
      const monthsAgo = (Date.now() - new Date(params.lastInspectionDate).getTime()) / (30 * 24 * 60 * 60 * 1000);
      if (monthsAgo <= 6) {
        factors.recentInspection = -20;
        score -= 20;
      }
    }

    // 5. Area discrepancy (0-100)
    if (params.areaTerreno && params.areaCartografica) {
      const diff = Math.abs(params.areaTerreno - params.areaCartografica);
      const pct = diff / Math.max(params.areaTerreno, params.areaCartografica) * 100;
      if (pct > 20) { factors.areaDiscrepancy = 100; score += 100; }
      else if (pct > 10) { factors.areaDiscrepancy = 50; score += 50; }
      else if (pct > 5) { factors.areaDiscrepancy = 25; score += 25; }
    }

    // 6. Zone change (0-30)
    if (params.zoneUpdatedAt) {
      const daysAgo = (Date.now() - new Date(params.zoneUpdatedAt).getTime()) / (24 * 60 * 60 * 1000);
      if (daysAgo <= 90) { factors.zoneChange = 30; score += 30; }
    }

    // Normalize and determine level
    score = Math.max(0, Math.min(100, Math.round(score / 4))); // 4 factors max 100 each, normalize to 0-100

    let riskLevel: FiscalRiskScore['riskLevel'] = 'BAIXO';
    if (score >= 75) riskLevel = 'CRITICO';
    else if (score >= 50) riskLevel = 'ALTO';
    else if (score >= 25) riskLevel = 'MEDIO';

    let recommendation = '';
    if (riskLevel === 'CRITICO') recommendation = 'Fiscalizacao imediata recomendada. Multiplos fatores de risco.';
    else if (riskLevel === 'ALTO') recommendation = 'Agendar vistoria em ate 15 dias. Risco elevado detectado.';
    else if (riskLevel === 'MEDIO') recommendation = 'Monitorar e agendar vistoria de rotina.';
    else recommendation = 'Situacao regular. Manter acompanhamento periodico.';

    return {
      parcelId: params.parcelId,
      sqlu: params.sqlu,
      riskLevel,
      score,
      factors,
      recommendation,
    };
  }

  /**
   * Rank multiple parcels by fiscal risk.
   */
  rankByRisk(parcels: Array<Parameters<FiscalRiskService['calculateRisk']>[0]>): FiscalRiskScore[] {
    return parcels
      .map((p) => this.calculateRisk(p))
      .sort((a, b) => b.score - a.score);
  }
}
