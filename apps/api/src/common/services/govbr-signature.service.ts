import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface GovBrSignedDocument {
  documentId: string;
  documentHash: string;
  signerName: string;
  signerCpf: string;
  accountLevel: 'PRATA' | 'OURO';
  signedAt: string;
  authority: string; // 'GOV.BR'
  signatureCriptografica: string; // SHA256withRSA signature simulated
  isValid: boolean;
}

@Injectable()
export class GovBrSignatureService {
  private rsaKeys: { publicKey: string; privateKey: string } | null = null;

  private getKeys() {
    if (!this.rsaKeys) {
      this.rsaKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
    }
    return this.rsaKeys;
  }

  /**
   * Simulates verification and signature E2E from Gov.br OAuth2 token.
   * Mandated to be Silver (PRATA) or Gold (OURO) level by federal decree.
   */
  async signDocumentWithGovBr(
    documentId: string,
    govBrToken: string,
    forcedSigner?: { name: string; cpf: string; level?: 'PRATA' | 'OURO' },
  ): Promise<GovBrSignedDocument> {
    if (!govBrToken || govBrToken.trim() === '') {
      throw new BadRequestException('Token do Gov.br inválido ou ausente.');
    }

    // Simulate token verification and validation
    // In demo environment, we accept any non-empty token and map it to a Silver/Gold profile.
    const isGold = govBrToken.includes('ouro') || govBrToken.length > 25;
    const accountLevel = isGold ? 'OURO' : 'PRATA';

    const signerName = forcedSigner?.name || 'Paulo de Oliveira (Servidor Municipal)';
    const signerCpf = forcedSigner?.cpf || '***.583.194-**';

    // Compute SHA-256 of documentId
    const documentHash = crypto.createHash('sha256').update(documentId).digest('hex');

    // Generate real cryptographic RSA signature using system keys to guarantee audit validation
    const { privateKey } = this.getKeys();
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(`${documentHash}|${signerName}|${signerCpf}|${accountLevel}`);
    const signatureCriptografica = signer.sign(privateKey, 'base64');

    return {
      documentId,
      documentHash,
      signerName,
      signerCpf,
      accountLevel,
      signedAt: new Date().toISOString(),
      authority: 'GOV.BR',
      signatureCriptografica,
      isValid: true,
    };
  }

  /**
   * Validates if a document signature verified with public key is structurally sound and unmodified.
   */
  verifyGovBrSignature(signed: GovBrSignedDocument): boolean {
    try {
      const { publicKey } = this.getKeys();
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${signed.documentHash}|${signed.signerName}|${signed.signerCpf}|${signed.accountLevel}`);
      return verifier.verify(publicKey, signed.signatureCriptografica, 'base64');
    } catch {
      return false;
    }
  }
}
