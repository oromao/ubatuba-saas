"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovBrSignatureService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let GovBrSignatureService = class GovBrSignatureService {
    constructor() {
        this.rsaKeys = null;
    }
    getKeys() {
        if (!this.rsaKeys) {
            this.rsaKeys = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });
        }
        return this.rsaKeys;
    }
    async signDocumentWithGovBr(documentId, govBrToken, forcedSigner) {
        if (!govBrToken || govBrToken.trim() === '') {
            throw new common_1.BadRequestException('Token do Gov.br inválido ou ausente.');
        }
        const isGold = govBrToken.includes('ouro') || govBrToken.length > 25;
        const accountLevel = isGold ? 'OURO' : 'PRATA';
        const signerName = forcedSigner?.name || 'Paulo de Oliveira (Servidor Municipal)';
        const signerCpf = forcedSigner?.cpf || '***.583.194-**';
        const documentHash = crypto.createHash('sha256').update(documentId).digest('hex');
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
    verifyGovBrSignature(signed) {
        try {
            const { publicKey } = this.getKeys();
            const verifier = crypto.createVerify('RSA-SHA256');
            verifier.update(`${signed.documentHash}|${signed.signerName}|${signed.signerCpf}|${signed.accountLevel}`);
            return verifier.verify(publicKey, signed.signatureCriptografica, 'base64');
        }
        catch {
            return false;
        }
    }
};
exports.GovBrSignatureService = GovBrSignatureService;
exports.GovBrSignatureService = GovBrSignatureService = __decorate([
    (0, common_1.Injectable)()
], GovBrSignatureService);
//# sourceMappingURL=govbr-signature.service.js.map