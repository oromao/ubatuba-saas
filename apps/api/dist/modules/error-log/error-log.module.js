"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const error_log_schema_1 = require("../../common/schemas/error-log.schema");
const error_log_service_1 = require("../../common/services/error-log.service");
const error_log_controller_1 = require("./error-log.controller");
let ErrorLogModule = class ErrorLogModule {
};
exports.ErrorLogModule = ErrorLogModule;
exports.ErrorLogModule = ErrorLogModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: error_log_schema_1.ErrorLog.name, schema: error_log_schema_1.ErrorLogSchema }]),
        ],
        controllers: [error_log_controller_1.ErrorLogController],
        providers: [error_log_service_1.ErrorLogService],
        exports: [error_log_service_1.ErrorLogService],
    })
], ErrorLogModule);
//# sourceMappingURL=error-log.module.js.map