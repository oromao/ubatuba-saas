"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelBuildingSchema = exports.ParcelBuilding = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ParcelBuilding = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true, collection: 'parcel_buildings' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _tenantId_decorators;
    let _tenantId_initializers = [];
    let _tenantId_extraInitializers = [];
    let _projectId_decorators;
    let _projectId_initializers = [];
    let _projectId_extraInitializers = [];
    let _parcelId_decorators;
    let _parcelId_initializers = [];
    let _parcelId_extraInitializers = [];
    let _useType_decorators;
    let _useType_initializers = [];
    let _useType_extraInitializers = [];
    let _constructionStandard_decorators;
    let _constructionStandard_initializers = [];
    let _constructionStandard_extraInitializers = [];
    let _builtArea_decorators;
    let _builtArea_initializers = [];
    let _builtArea_extraInitializers = [];
    let _floors_decorators;
    let _floors_initializers = [];
    let _floors_extraInitializers = [];
    let _constructionYear_decorators;
    let _constructionYear_initializers = [];
    let _constructionYear_extraInitializers = [];
    let _occupancyType_decorators;
    let _occupancyType_initializers = [];
    let _occupancyType_extraInitializers = [];
    let _uso_decorators;
    let _uso_initializers = [];
    let _uso_extraInitializers = [];
    let _padraoConstrutivo_decorators;
    let _padraoConstrutivo_initializers = [];
    let _padraoConstrutivo_extraInitializers = [];
    let _areaConstruida_decorators;
    let _areaConstruida_initializers = [];
    let _areaConstruida_extraInitializers = [];
    let _pavimentos_decorators;
    let _pavimentos_initializers = [];
    let _pavimentos_extraInitializers = [];
    let _anoConstrucao_decorators;
    let _anoConstrucao_initializers = [];
    let _anoConstrucao_extraInitializers = [];
    let _tipoOcupacao_decorators;
    let _tipoOcupacao_initializers = [];
    let _tipoOcupacao_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _updatedBy_decorators;
    let _updatedBy_initializers = [];
    let _updatedBy_extraInitializers = [];
    var ParcelBuilding = _classThis = class {
        constructor() {
            this.tenantId = __runInitializers(this, _tenantId_initializers, void 0);
            this.projectId = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
            this.parcelId = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _parcelId_initializers, void 0));
            this.useType = (__runInitializers(this, _parcelId_extraInitializers), __runInitializers(this, _useType_initializers, void 0));
            this.constructionStandard = (__runInitializers(this, _useType_extraInitializers), __runInitializers(this, _constructionStandard_initializers, void 0));
            this.builtArea = (__runInitializers(this, _constructionStandard_extraInitializers), __runInitializers(this, _builtArea_initializers, void 0));
            this.floors = (__runInitializers(this, _builtArea_extraInitializers), __runInitializers(this, _floors_initializers, void 0));
            this.constructionYear = (__runInitializers(this, _floors_extraInitializers), __runInitializers(this, _constructionYear_initializers, void 0));
            this.occupancyType = (__runInitializers(this, _constructionYear_extraInitializers), __runInitializers(this, _occupancyType_initializers, void 0));
            this.uso = (__runInitializers(this, _occupancyType_extraInitializers), __runInitializers(this, _uso_initializers, void 0));
            this.padraoConstrutivo = (__runInitializers(this, _uso_extraInitializers), __runInitializers(this, _padraoConstrutivo_initializers, void 0));
            this.areaConstruida = (__runInitializers(this, _padraoConstrutivo_extraInitializers), __runInitializers(this, _areaConstruida_initializers, void 0));
            this.pavimentos = (__runInitializers(this, _areaConstruida_extraInitializers), __runInitializers(this, _pavimentos_initializers, void 0));
            this.anoConstrucao = (__runInitializers(this, _pavimentos_extraInitializers), __runInitializers(this, _anoConstrucao_initializers, void 0));
            this.tipoOcupacao = (__runInitializers(this, _anoConstrucao_extraInitializers), __runInitializers(this, _tipoOcupacao_initializers, void 0));
            this.createdBy = (__runInitializers(this, _tipoOcupacao_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.updatedBy = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _updatedBy_initializers, void 0));
            __runInitializers(this, _updatedBy_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ParcelBuilding");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _tenantId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _projectId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _parcelId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _useType_decorators = [(0, mongoose_1.Prop)()];
        _constructionStandard_decorators = [(0, mongoose_1.Prop)()];
        _builtArea_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _floors_decorators = [(0, mongoose_1.Prop)()];
        _constructionYear_decorators = [(0, mongoose_1.Prop)()];
        _occupancyType_decorators = [(0, mongoose_1.Prop)()];
        _uso_decorators = [(0, mongoose_1.Prop)()];
        _padraoConstrutivo_decorators = [(0, mongoose_1.Prop)()];
        _areaConstruida_decorators = [(0, mongoose_1.Prop)()];
        _pavimentos_decorators = [(0, mongoose_1.Prop)()];
        _anoConstrucao_decorators = [(0, mongoose_1.Prop)()];
        _tipoOcupacao_decorators = [(0, mongoose_1.Prop)()];
        _createdBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        _updatedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: obj => "projectId" in obj, get: obj => obj.projectId, set: (obj, value) => { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
        __esDecorate(null, null, _parcelId_decorators, { kind: "field", name: "parcelId", static: false, private: false, access: { has: obj => "parcelId" in obj, get: obj => obj.parcelId, set: (obj, value) => { obj.parcelId = value; } }, metadata: _metadata }, _parcelId_initializers, _parcelId_extraInitializers);
        __esDecorate(null, null, _useType_decorators, { kind: "field", name: "useType", static: false, private: false, access: { has: obj => "useType" in obj, get: obj => obj.useType, set: (obj, value) => { obj.useType = value; } }, metadata: _metadata }, _useType_initializers, _useType_extraInitializers);
        __esDecorate(null, null, _constructionStandard_decorators, { kind: "field", name: "constructionStandard", static: false, private: false, access: { has: obj => "constructionStandard" in obj, get: obj => obj.constructionStandard, set: (obj, value) => { obj.constructionStandard = value; } }, metadata: _metadata }, _constructionStandard_initializers, _constructionStandard_extraInitializers);
        __esDecorate(null, null, _builtArea_decorators, { kind: "field", name: "builtArea", static: false, private: false, access: { has: obj => "builtArea" in obj, get: obj => obj.builtArea, set: (obj, value) => { obj.builtArea = value; } }, metadata: _metadata }, _builtArea_initializers, _builtArea_extraInitializers);
        __esDecorate(null, null, _floors_decorators, { kind: "field", name: "floors", static: false, private: false, access: { has: obj => "floors" in obj, get: obj => obj.floors, set: (obj, value) => { obj.floors = value; } }, metadata: _metadata }, _floors_initializers, _floors_extraInitializers);
        __esDecorate(null, null, _constructionYear_decorators, { kind: "field", name: "constructionYear", static: false, private: false, access: { has: obj => "constructionYear" in obj, get: obj => obj.constructionYear, set: (obj, value) => { obj.constructionYear = value; } }, metadata: _metadata }, _constructionYear_initializers, _constructionYear_extraInitializers);
        __esDecorate(null, null, _occupancyType_decorators, { kind: "field", name: "occupancyType", static: false, private: false, access: { has: obj => "occupancyType" in obj, get: obj => obj.occupancyType, set: (obj, value) => { obj.occupancyType = value; } }, metadata: _metadata }, _occupancyType_initializers, _occupancyType_extraInitializers);
        __esDecorate(null, null, _uso_decorators, { kind: "field", name: "uso", static: false, private: false, access: { has: obj => "uso" in obj, get: obj => obj.uso, set: (obj, value) => { obj.uso = value; } }, metadata: _metadata }, _uso_initializers, _uso_extraInitializers);
        __esDecorate(null, null, _padraoConstrutivo_decorators, { kind: "field", name: "padraoConstrutivo", static: false, private: false, access: { has: obj => "padraoConstrutivo" in obj, get: obj => obj.padraoConstrutivo, set: (obj, value) => { obj.padraoConstrutivo = value; } }, metadata: _metadata }, _padraoConstrutivo_initializers, _padraoConstrutivo_extraInitializers);
        __esDecorate(null, null, _areaConstruida_decorators, { kind: "field", name: "areaConstruida", static: false, private: false, access: { has: obj => "areaConstruida" in obj, get: obj => obj.areaConstruida, set: (obj, value) => { obj.areaConstruida = value; } }, metadata: _metadata }, _areaConstruida_initializers, _areaConstruida_extraInitializers);
        __esDecorate(null, null, _pavimentos_decorators, { kind: "field", name: "pavimentos", static: false, private: false, access: { has: obj => "pavimentos" in obj, get: obj => obj.pavimentos, set: (obj, value) => { obj.pavimentos = value; } }, metadata: _metadata }, _pavimentos_initializers, _pavimentos_extraInitializers);
        __esDecorate(null, null, _anoConstrucao_decorators, { kind: "field", name: "anoConstrucao", static: false, private: false, access: { has: obj => "anoConstrucao" in obj, get: obj => obj.anoConstrucao, set: (obj, value) => { obj.anoConstrucao = value; } }, metadata: _metadata }, _anoConstrucao_initializers, _anoConstrucao_extraInitializers);
        __esDecorate(null, null, _tipoOcupacao_decorators, { kind: "field", name: "tipoOcupacao", static: false, private: false, access: { has: obj => "tipoOcupacao" in obj, get: obj => obj.tipoOcupacao, set: (obj, value) => { obj.tipoOcupacao = value; } }, metadata: _metadata }, _tipoOcupacao_initializers, _tipoOcupacao_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _updatedBy_decorators, { kind: "field", name: "updatedBy", static: false, private: false, access: { has: obj => "updatedBy" in obj, get: obj => obj.updatedBy, set: (obj, value) => { obj.updatedBy = value; } }, metadata: _metadata }, _updatedBy_initializers, _updatedBy_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParcelBuilding = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParcelBuilding = _classThis;
})();
exports.ParcelBuilding = ParcelBuilding;
exports.ParcelBuildingSchema = mongoose_1.SchemaFactory.createForClass(ParcelBuilding);
exports.ParcelBuildingSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
