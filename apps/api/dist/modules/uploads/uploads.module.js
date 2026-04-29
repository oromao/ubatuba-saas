"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const upload_schema_1 = require("./upload.schema");
const uploads_repository_1 = require("./uploads.repository");
const upload_service_1 = require("./upload.service");
const upload_controller_1 = require("./upload.controller");
const object_storage_service_1 = require("../shared/object-storage.service");
let UploadsModule = class UploadsModule {
};
exports.UploadsModule = UploadsModule;
exports.UploadsModule = UploadsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: upload_schema_1.Upload.name, schema: upload_schema_1.UploadSchema }])],
        controllers: [upload_controller_1.UploadController],
        providers: [uploads_repository_1.UploadsRepository, upload_service_1.UploadService, object_storage_service_1.ObjectStorageService],
        exports: [uploads_repository_1.UploadsRepository, upload_service_1.UploadService],
    })
], UploadsModule);
//# sourceMappingURL=uploads.module.js.map