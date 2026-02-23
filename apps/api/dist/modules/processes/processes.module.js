"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cache_service_1 = require("../shared/cache.service");
const redis_service_1 = require("../shared/redis.service");
const process_schema_1 = require("./process.schema");
const process_event_schema_1 = require("./process-event.schema");
const processes_controller_1 = require("./processes.controller");
const processes_repository_1 = require("./processes.repository");
const processes_service_1 = require("./processes.service");
let ProcessesModule = class ProcessesModule {
};
exports.ProcessesModule = ProcessesModule;
exports.ProcessesModule = ProcessesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: process_schema_1.Process.name, schema: process_schema_1.ProcessSchema },
                { name: process_event_schema_1.ProcessEvent.name, schema: process_event_schema_1.ProcessEventSchema },
            ]),
        ],
        controllers: [processes_controller_1.ProcessesController],
        providers: [processes_repository_1.ProcessesRepository, processes_service_1.ProcessesService, cache_service_1.CacheService, redis_service_1.RedisService],
        exports: [processes_service_1.ProcessesService],
    })
], ProcessesModule);
//# sourceMappingURL=processes.module.js.map