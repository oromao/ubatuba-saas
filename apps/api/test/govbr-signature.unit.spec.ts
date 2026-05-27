import { GovBrSignatureService } from '../src/common/services/govbr-signature.service';

describe('GovBrSignatureService (T13-SPRINT2-INIT)', () => {
  let service: GovBrSignatureService;

  beforeEach(() => {
    service = new GovBrSignatureService();
  });

  it('deve gerar assinatura Gov.br valida do nivel PRATA por padrao', async () => {
    const res = await service.signDocumentWithGovBr('doc-123', 'token-valido-prata');
    
    expect(res.documentId).toBe('doc-123');
    expect(res.accountLevel).toBe('PRATA');
    expect(res.authority).toBe('GOV.BR');
    expect(res.isValid).toBe(true);
    expect(res.signerName).toContain('Paulo de Oliveira');
    expect(res.signatureCriptografica).toBeDefined();
  });

  it('deve elevar nivel da assinatura para OURO se o token sugerir', async () => {
    const res = await service.signDocumentWithGovBr('doc-123', 'token-nivel-ouro-super-seguro');
    
    expect(res.accountLevel).toBe('OURO');
  });

  it('deve validar e aprovar assinaturas assinadas com a mesma chave publica', async () => {
    const signed = await service.signDocumentWithGovBr('doc-abc', 'token-ouro');
    const isVerified = service.verifyGovBrSignature(signed);
    
    expect(isVerified).toBe(true);
  });

  it('deve invalidar assinaturas que foram modificadas ou adulteradas por terceiros', async () => {
    const signed = await service.signDocumentWithGovBr('doc-abc', 'token-ouro');
    
    // Adulterando dados assinados
    const tampered = {
      ...signed,
      signerName: 'Atacante Malicioso',
    };

    const isVerified = service.verifyGovBrSignature(tampered);
    expect(isVerified).toBe(false);
  });

  it('deve falhar se o token do Gov.br for nulo ou vazio', async () => {
    await expect(service.signDocumentWithGovBr('doc-123', '')).rejects.toThrow();
  });
});
