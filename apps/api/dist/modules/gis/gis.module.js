"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GisModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const gis_service_1 = require("./gis.service");
const gis_controller_1 = require("./gis.controller");
const parcel_schema_1 = require("../ctm/parcels/parcel.schema");
let GisModule = class GisModule {
};
exports.GisModule = GisModule;
exports.GisModule = GisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: parcel_schema_1.Parcel.name, schema: parcel_schema_1.ParcelSchema },
            ]),
        ],
        controllers: [gis_controller_1.GisController],
        providers: [gis_service_1.GisService],
        exports: [gis_service_1.GisService],
    })
], GisModule);
//# sourceMappingURL=gis.module.js.map