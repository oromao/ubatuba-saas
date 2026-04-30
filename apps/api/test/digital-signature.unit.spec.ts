import { Test, TestingModule } from '@nestjs/testing';
import { DigitalSignatureService } from '../src/common/services/digital-signature.service';

describe('DigitalSignatureService (T8-CERT-SIGN)', () => {
  let service: DigitalSignatureService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DigitalSignatureService],
    }).compile();
    service = moduleRef.get<DigitalSignatureService>(DigitalSignatureService);
  });

  describe('key generation', () => {
    it('should generate RSA key pair', () => {
      const keyPair = service.getKeyPair();
      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });

    it('should return same key pair on subsequent calls', () => {
      const kp1 = service.getKeyPair();
      const kp2 = service.getKeyPair();
      expect(kp1).toBe(kp2);
    });
  });

  describe('signPayload', () => {
    it('should sign a payload and return signature', () => {
      const payload = { name: 'Joao', type: 'ALVARA', date: '2026-04-30' };
      const result = service.signPayload(payload);

      expect(result.payload).toEqual(payload);
      expect(result.signature).toBeDefined();
      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBeGreaterThan(100);
      expect(result.algorithm).toBe('RSA-SHA256');
      expect(result.signedAt).toBeDefined();
      expect(result.publicKeyPem).toBeDefined();
      expect(result.publicKeyPem).toContain('BEGIN PUBLIC KEY');
    });

    it('should produce different signatures for different payloads', () => {
      const sig1 = service.signPayload({ id: 1 });
      const sig2 = service.signPayload({ id: 2 });
      expect(sig1.signature).not.toBe(sig2.signature);
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', () => {
      const payload = { documentId: 'abc123', tipo: 'ALVARA_OBRAS' };
      const signed = service.signPayload(payload);
      const valid = service.verifySignature(signed);
      expect(valid).toBe(true);
    });

    it('should reject tampered payload', () => {
      const payload = { documentId: 'abc123' };
      const signed = service.signPayload(payload);
      // Tamper with the payload
      const tampered = {
        ...signed,
        payload: { documentId: 'hacked' },
      };
      const valid = service.verifySignature(tampered);
      expect(valid).toBe(false);
    });

    it('should reject invalid signature', () => {
      const result = service.verifySignature({
        payload: { test: true },
        signature: 'invalid-base64',
        algorithm: 'RSA-SHA256',
        signedAt: new Date().toISOString(),
        publicKeyPem: 'invalid-key',
      });
      expect(result).toBe(false);
    });
  });

  describe('hashPayload', () => {
    it('should compute SHA-256 hash', () => {
      const hash = service.hashPayload({ test: 'data' });
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 = 64 hex chars
    });

    it('should produce same hash for same payload', () => {
      const h1 = service.hashPayload({ a: 1, b: 2 });
      const h2 = service.hashPayload({ a: 1, b: 2 });
      expect(h1).toBe(h2);
    });
  });
});
