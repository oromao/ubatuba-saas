import { Injectable } from '@nestjs/common';
import {
  generateKeyPairSync,
  createSign,
  createVerify,
  createHash,
} from 'crypto';

export interface SignedPayload {
  payload: Record<string, unknown>;
  signature: string;     // base64-encoded RSA-SHA256 signature
  algorithm: string;     // 'RSA-SHA256'
  signedAt: string;      // ISO timestamp
  publicKeyPem: string;  // public key for verification
}

@Injectable()
export class DigitalSignatureService {
  private keyPair: { publicKey: string; privateKey: string } | null = null;

  /**
   * Get or generate the RSA key pair for signing.
   */
  getKeyPair(): { publicKey: string; privateKey: string } {
    if (!this.keyPair) {
      this.keyPair = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
    }
    return this.keyPair;
  }

  /**
   * Sign a JSON payload, returning the signature and public key.
   */
  signPayload(payload: Record<string, unknown>): SignedPayload {
    const { privateKey, publicKey } = this.getKeyPair();
    const payloadStr = JSON.stringify(payload);

    const signer = createSign('RSA-SHA256');
    signer.update(payloadStr);
    const signature = signer.sign(privateKey, 'base64');

    return {
      payload,
      signature: signature as string,
      algorithm: 'RSA-SHA256',
      signedAt: new Date().toISOString(),
      publicKeyPem: publicKey,
    };
  }

  /**
   * Verify a signed payload against the public key.
   */
  verifySignature(signed: SignedPayload): boolean {
    try {
      const { publicKey } = this.getKeyPair();
      const payloadStr = JSON.stringify(signed.payload);

      const verifier = createVerify('RSA-SHA256');
      verifier.update(payloadStr);
      return verifier.verify(publicKey, signed.signature, 'base64');
    } catch {
      return false;
    }
  }

  /**
   * Compute SHA-256 hash of a payload.
   */
  hashPayload(payload: Record<string, unknown>): string {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}
