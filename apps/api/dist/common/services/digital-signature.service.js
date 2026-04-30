"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalSignatureService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let DigitalSignatureService = class DigitalSignatureService {
    constructor() {
        this.keyPair = null;
    }
    getKeyPair() {
        if (!this.keyPair) {
            this.keyPair = (0, crypto_1.generateKeyPairSync)('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });
        }
        return this.keyPair;
    }
    signPayload(payload) {
        const { privateKey, publicKey } = this.getKeyPair();
        const payloadStr = JSON.stringify(payload);
        const signer = (0, crypto_1.createSign)('RSA-SHA256');
        signer.update(payloadStr);
        const signature = signer.sign(privateKey, 'base64');
        return {
            payload,
            signature: signature,
            algorithm: 'RSA-SHA256',
            signedAt: new Date().toISOString(),
            publicKeyPem: publicKey,
        };
    }
    verifySignature(signed) {
        try {
            const { publicKey } = this.getKeyPair();
            const payloadStr = JSON.stringify(signed.payload);
            const verifier = (0, crypto_1.createVerify)('RSA-SHA256');
            verifier.update(payloadStr);
            return verifier.verify(publicKey, signed.signature, 'base64');
        }
        catch {
            return false;
        }
    }
    hashPayload(payload) {
        return (0, crypto_1.createHash)('sha256').update(JSON.stringify(payload)).digest('hex');
    }
};
exports.DigitalSignatureService = DigitalSignatureService;
exports.DigitalSignatureService = DigitalSignatureService = __decorate([
    (0, common_1.Injectable)()
], DigitalSignatureService);
//# sourceMappingURL=digital-signature.service.js.map