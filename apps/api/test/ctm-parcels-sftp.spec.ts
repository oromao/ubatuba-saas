import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
const parcelsRepository = {} as any;
const projectsService = {} as any;
const parcelBuildingsService = {} as any;
const parcelSocioeconomicService = {} as any;
const parcelInfrastructureService = {} as any;
const logradourosService = {} as any;
const parcelAuditRepository = {} as any;
const importBatchRepository = {} as any;

describe('ParcelsService - SFTP Synchronization', () => {
  let service: ParcelsService;
  const inboxPath = path.join(process.cwd(), 'sftp_inbox');
  const processedPath = path.join(inboxPath, 'processed');

  beforeEach(() => {
    service = new ParcelsService(
      parcelsRepository,
      projectsService,
      parcelBuildingsService,
      parcelSocioeconomicService,
      parcelInfrastructureService,
      logradourosService,
      parcelAuditRepository,
      importBatchRepository,
    );

    // Clean sftp directories
    if (fs.existsSync(inboxPath)) {
      const files = fs.readdirSync(inboxPath);
      for (const file of files) {
        const filePath = path.join(inboxPath, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    }
    if (fs.existsSync(processedPath)) {
      const files = fs.readdirSync(processedPath);
      for (const file of files) {
        fs.unlinkSync(path.join(processedPath, file));
      }
    }
  });

  it('deve retornar mensagem amigavel se nao houver arquivos no inbox', async () => {
    const res = await service.syncFromSftpInbox('tenant-1', 'project-1', 'user-1');
    expect(res.processedFiles).toBe(0);
    expect(res.message).toContain('Nenhum arquivo');
  });

  it('deve processar arquivo CSV no inbox, enriquecer parcelas e mover para processados', async () => {
    // Escrever arquivo de teste no inbox
    const csvFileName = 'tributos_teste.csv';
    const csvFilePath = path.join(inboxPath, csvFileName);
    fs.writeFileSync(csvFilePath, 'sqlu,valorVenalTotal\n123.456.789-0,500000\n');

    // Spy no importFromCsvEnrichment
    const spyEnrich = jest.spyOn(service, 'importFromCsvEnrichment').mockResolvedValue({
      batchId: 'batch-123',
      processed: 1,
      updated: 1,
      notFound: 0,
      errors: 0,
      errorDetails: [],
    });

    const res = await service.syncFromSftpInbox('tenant-1', 'project-1', 'user-1');

    expect(res.processedFiles).toBe(1);
    expect(spyEnrich).toHaveBeenCalled();
    expect(res.results[0].status).toBe('success');
    expect(res.results[0].fileName).toBe(csvFileName);

    // Verificar se o arquivo original foi removido do inbox
    expect(fs.existsSync(csvFilePath)).toBe(false);

    // Verificar se foi movido para a pasta processed
    const processedFiles = fs.readdirSync(processedPath);
    expect(processedFiles.length).toBe(1);
    expect(processedFiles[0]).toContain('tributos_teste_');
  });

  it('deve retornar status correto da inbox de SFTP', async () => {
    // Escrever arquivo pendente
    const csvFilePath = path.join(inboxPath, 'pendente.csv');
    fs.writeFileSync(csvFilePath, 'sqlu,iptuLancado\n123.456.789-0,1500\n');

    // Escrever arquivo processado
    const processedFilePath = path.join(processedPath, 'processado.csv');
    fs.writeFileSync(processedFilePath, 'sqlu,iptuPago\n123.456.789-0,1500\n');

    const status = await service.getSftpInboxStatus();

    expect(status.pendingCount).toBe(1);
    expect(status.pendingFiles[0].fileName).toBe('pendente.csv');
    expect(status.processedCount).toBe(1);
    expect(status.processedFiles[0].fileName).toBe('processado.csv');
  });

  it('deve depositar arquivo CSV com sucesso no inbox', async () => {
    const res = await service.depositSftpFile('meu_arquivo_teste', 'sqlu,bairro\n001.002.003,Centro\n');
    expect(res.success).toBe(true);
    expect(res.fileName).toBe('meu_arquivo_teste.csv');
    expect(fs.existsSync(res.filePath)).toBe(true);
  });
});
