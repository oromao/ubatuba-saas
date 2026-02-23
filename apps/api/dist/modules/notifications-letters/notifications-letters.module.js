"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsLettersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ctm_module_1 = require("../ctm/ctm.module");
const projects_module_1 = require("../projects/projects.module");
const object_storage_service_1 = require("../shared/object-storage.service");
const letter_batch_schema_1 = require("./letter-batch.schema");
const letter_template_schema_1 = require("./letter-template.schema");
const notifications_letters_controller_1 = require("./notifications-letters.controller");
const notifications_letters_repository_1 = require("./notifications-letters.repository");
const notifications_letters_service_1 = require("./notifications-letters.service");
let NotificationsLettersModule = class NotificationsLettersModule {
};
exports.NotificationsLettersModule = NotificationsLettersModule;
exports.NotificationsLettersModule = NotificationsLettersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            projects_module_1.ProjectsModule,
            ctm_module_1.CtmModule,
            mongoose_1.MongooseModule.forFeature([
                { name: letter_template_schema_1.LetterTemplate.name, schema: letter_template_schema_1.LetterTemplateSchema },
                { name: letter_batch_schema_1.LetterBatch.name, schema: letter_batch_schema_1.LetterBatchSchema },
            ]),
        ],
        controllers: [notifications_letters_controller_1.NotificationsLettersController],
        providers: [notifications_letters_repository_1.NotificationsLettersRepository, notifications_letters_service_1.NotificationsLettersService, object_storage_service_1.ObjectStorageService],
    })
], NotificationsLettersModule);
//# sourceMappingURL=notifications-letters.module.js.map