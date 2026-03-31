import { Injectable, Logger } from '@nestjs/common';
import * as JSZip from 'jszip';
import * as PDFDocument from 'pdfkit';

/**
 * Módulo de Exportações Essencial para o Cartório.
 * "O Canivete Suíço da REURB-S"
 * Responsável por gerar os pacotes CRF contendo PDFs dos laudos, listagem em CSV e as Plantas Topográficas (Mapas).
 */
@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  /**
   * Empacota o Dossiê REURB-S do Município
   * @param nucleoId ID do Núcleo da Reurb
   * @param metadata Informações adicionais injetadas por Audit API.
   * @returns Retorna o Buffer Compactado (ZIP) do laudo final para anexos do SEI/Cartório.
   */
  async generateReurbS_Dossier(nucleoId: string, metadata: { reqTenant: string, actor: string }): Promise<Buffer> {
    this.logger.log(`[EXPORT: ${metadata.reqTenant}] - Iniciando Geração do Dossiê ZIP do Núcleo: ${nucleoId}`);
    
    const zip = new JSZip();

    // 1. Simula Dossiê de Famílias em CSV
    const csvContent = "NOME,CPF,QUADRA,LOTE,RENDA\nJoão da Silva,111.222.333-44,A,01,1500.00\nMaria Souza,222.333.444-55,A,02,0.00";
    zip.file("Lista_Ocupantes_Selada.csv", csvContent);
    
    // 2. Simula Planta Topográfica do GeoServer BBOX Export (GeoJSON Dummy)
    const mockGeoJSON = JSON.stringify({
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { lote: "01", quadra: "A" }, geometry: { type: "Polygon", coordinates: [[[0,0], [0,1], [1,1], [1,0], [0,0]]]}}
      ]
    }, null, 2);
    zip.file("Planta_Georreferenciada_SIRGAS2000.geojson", mockGeoJSON);
    
    // 3. Simulação de um Laudo Assistencial PDF Genérico (Automated) PDFKit
    const pdfBuffer = await this.generateCertificatePdf(nucleoId, metadata);
    zip.file("CRF_Emissao_Automatica_Assinada.pdf", pdfBuffer);

    this.logger.log(`[ZIP BUILD] Concluído para Núcleo ${nucleoId}. Redirecionando payload para S3/MinIO ou Client.`);
    return zip.generateAsync({ type: 'nodebuffer', compression: "DEFLATE", compressionOptions: { level: 9 } });
  }

  private generateCertificatePdf(nucleoId: string, metadata: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header Edital CE 24/2025
        doc.fontSize(20).text('CERTIDÃO DE REGULARIZAÇÃO FUNDIÁRIA (CRF)', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Referência Núcleo ID: ${nucleoId}`);
        doc.text(`Tenant/Município: ${metadata.reqTenant}`);
        doc.text(`Operador Sistêmico (Gerado por): ${metadata.actor}`);
        doc.text(`Data de Emissão: ${new Date().toISOString()}`);
        doc.moveDown();
        doc.text(`Nos termos da Lei 13.465/2017 e diretrizes do licitatório CE 24/2025 de Ubatuba-SP, atesta-se digitalmente a lisura dos levantamentos contidos neste dossiê anexado.`);
        
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
