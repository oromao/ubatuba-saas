"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const process_schema_1 = require("../processes/process.schema");
const processes_module_1 = require("../processes/processes.module");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const redis_service_1 = require("../shared/redis.service");
const certificate_schema_1 = require("./certificate.schema");
const certificates_controller_1 = require("./certificates.controller");
const certificates_repository_1 = require("./certificates.repository");
const certificates_service_1 = require("./certificates.service");
let CertificatesModule = class CertificatesModule {
};
exports.CertificatesModule = CertificatesModule;
exports.CertificatesModule = CertificatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            processes_module_1.ProcessesModule,
            mongoose_1.MongooseModule.forFeature([
                { name: certificate_schema_1.Certificate.name, schema: certificate_schema_1.CertificateSchema },
                { name: process_schema_1.Process.name, schema: process_schema_1.ProcessSchema },
            ]),
        ],
        controllers: [certificates_controller_1.CertificatesController],
        providers: [certificates_repository_1.CertificatesRepository, certificates_service_1.CertificatesService, cache_service_1.CacheService, redis_service_1.RedisService, object_storage_service_1.ObjectStorageService],
        exports: [certificates_service_1.CertificatesService],
    })
], CertificatesModule);
//# sourceMappingURL=certificates.module.js.map