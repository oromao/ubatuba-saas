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
exports.ParcelInfrastructureSchema = exports.ParcelInfrastructure = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ParcelInfrastructure = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true, collection: 'parcel_infrastructure' })];
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
    let _water_decorators;
    let _water_initializers = [];
    let _water_extraInitializers = [];
    let _agua_decorators;
    let _agua_initializers = [];
    let _agua_extraInitializers = [];
    let _sewage_decorators;
    let _sewage_initializers = [];
    let _sewage_extraInitializers = [];
    let _esgoto_decorators;
    let _esgoto_initializers = [];
    let _esgoto_extraInitializers = [];
    let _electricity_decorators;
    let _electricity_initializers = [];
    let _electricity_extraInitializers = [];
    let _energia_decorators;
    let _energia_initializers = [];
    let _energia_extraInitializers = [];
    let _pavingType_decorators;
    let _pavingType_initializers = [];
    let _pavingType_extraInitializers = [];
    let _pavimentacao_decorators;
    let _pavimentacao_initializers = [];
    let _pavimentacao_extraInitializers = [];
    let _publicLighting_decorators;
    let _publicLighting_initializers = [];
    let _publicLighting_extraInitializers = [];
    let _iluminacao_decorators;
    let _iluminacao_initializers = [];
    let _iluminacao_extraInitializers = [];
    let _garbageCollection_decorators;
    let _garbageCollection_initializers = [];
    let _garbageCollection_extraInitializers = [];
    let _coleta_decorators;
    let _coleta_initializers = [];
    let _coleta_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _updatedBy_decorators;
    let _updatedBy_initializers = [];
    let _updatedBy_extraInitializers = [];
    var ParcelInfrastructure = _classThis = class {
        constructor() {
            this.tenantId = __runInitializers(this, _tenantId_initializers, void 0);
            this.projectId = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
            this.parcelId = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _parcelId_initializers, void 0));
            this.water = (__runInitializers(this, _parcelId_extraInitializers), __runInitializers(this, _water_initializers, void 0));
            this.agua = (__runInitializers(this, _water_extraInitializers), __runInitializers(this, _agua_initializers, void 0));
            this.sewage = (__runInitializers(this, _agua_extraInitializers), __runInitializers(this, _sewage_initializers, void 0));
            this.esgoto = (__runInitializers(this, _sewage_extraInitializers), __runInitializers(this, _esgoto_initializers, void 0));
            this.electricity = (__runInitializers(this, _esgoto_extraInitializers), __runInitializers(this, _electricity_initializers, void 0));
            this.energia = (__runInitializers(this, _electricity_extraInitializers), __runInitializers(this, _energia_initializers, void 0));
            this.pavingType = (__runInitializers(this, _energia_extraInitializers), __runInitializers(this, _pavingType_initializers, void 0));
            this.pavimentacao = (__runInitializers(this, _pavingType_extraInitializers), __runInitializers(this, _pavimentacao_initializers, void 0));
            this.publicLighting = (__runInitializers(this, _pavimentacao_extraInitializers), __runInitializers(this, _publicLighting_initializers, void 0));
            this.iluminacao = (__runInitializers(this, _publicLighting_extraInitializers), __runInitializers(this, _iluminacao_initializers, void 0));
            this.garbageCollection = (__runInitializers(this, _iluminacao_extraInitializers), __runInitializers(this, _garbageCollection_initializers, void 0));
            this.coleta = (__runInitializers(this, _garbageCollection_extraInitializers), __runInitializers(this, _coleta_initializers, void 0));
            this.createdBy = (__runInitializers(this, _coleta_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.updatedBy = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _updatedBy_initializers, void 0));
            __runInitializers(this, _updatedBy_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ParcelInfrastructure");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _tenantId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _projectId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _parcelId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _water_decorators = [(0, mongoose_1.Prop)()];
        _agua_decorators = [(0, mongoose_1.Prop)()];
        _sewage_decorators = [(0, mongoose_1.Prop)()];
        _esgoto_decorators = [(0, mongoose_1.Prop)()];
        _electricity_decorators = [(0, mongoose_1.Prop)()];
        _energia_decorators = [(0, mongoose_1.Prop)()];
        _pavingType_decorators = [(0, mongoose_1.Prop)()];
        _pavimentacao_decorators = [(0, mongoose_1.Prop)()];
        _publicLighting_decorators = [(0, mongoose_1.Prop)()];
        _iluminacao_decorators = [(0, mongoose_1.Prop)()];
        _garbageCollection_decorators = [(0, mongoose_1.Prop)()];
        _coleta_decorators = [(0, mongoose_1.Prop)()];
        _createdBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        _updatedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: obj => "projectId" in obj, get: obj => obj.projectId, set: (obj, value) => { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
        __esDecorate(null, null, _parcelId_decorators, { kind: "field", name: "parcelId", static: false, private: false, access: { has: obj => "parcelId" in obj, get: obj => obj.parcelId, set: (obj, value) => { obj.parcelId = value; } }, metadata: _metadata }, _parcelId_initializers, _parcelId_extraInitializers);
        __esDecorate(null, null, _water_decorators, { kind: "field", name: "water", static: false, private: false, access: { has: obj => "water" in obj, get: obj => obj.water, set: (obj, value) => { obj.water = value; } }, metadata: _metadata }, _water_initializers, _water_extraInitializers);
        __esDecorate(null, null, _agua_decorators, { kind: "field", name: "agua", static: false, private: false, access: { has: obj => "agua" in obj, get: obj => obj.agua, set: (obj, value) => { obj.agua = value; } }, metadata: _metadata }, _agua_initializers, _agua_extraInitializers);
        __esDecorate(null, null, _sewage_decorators, { kind: "field", name: "sewage", static: false, private: false, access: { has: obj => "sewage" in obj, get: obj => obj.sewage, set: (obj, value) => { obj.sewage = value; } }, metadata: _metadata }, _sewage_initializers, _sewage_extraInitializers);
        __esDecorate(null, null, _esgoto_decorators, { kind: "field", name: "esgoto", static: false, private: false, access: { has: obj => "esgoto" in obj, get: obj => obj.esgoto, set: (obj, value) => { obj.esgoto = value; } }, metadata: _metadata }, _esgoto_initializers, _esgoto_extraInitializers);
        __esDecorate(null, null, _electricity_decorators, { kind: "field", name: "electricity", static: false, private: false, access: { has: obj => "electricity" in obj, get: obj => obj.electricity, set: (obj, value) => { obj.electricity = value; } }, metadata: _metadata }, _electricity_initializers, _electricity_extraInitializers);
        __esDecorate(null, null, _energia_decorators, { kind: "field", name: "energia", static: false, private: false, access: { has: obj => "energia" in obj, get: obj => obj.energia, set: (obj, value) => { obj.energia = value; } }, metadata: _metadata }, _energia_initializers, _energia_extraInitializers);
        __esDecorate(null, null, _pavingType_decorators, { kind: "field", name: "pavingType", static: false, private: false, access: { has: obj => "pavingType" in obj, get: obj => obj.pavingType, set: (obj, value) => { obj.pavingType = value; } }, metadata: _metadata }, _pavingType_initializers, _pavingType_extraInitializers);
        __esDecorate(null, null, _pavimentacao_decorators, { kind: "field", name: "pavimentacao", static: false, private: false, access: { has: obj => "pavimentacao" in obj, get: obj => obj.pavimentacao, set: (obj, value) => { obj.pavimentacao = value; } }, metadata: _metadata }, _pavimentacao_initializers, _pavimentacao_extraInitializers);
        __esDecorate(null, null, _publicLighting_decorators, { kind: "field", name: "publicLighting", static: false, private: false, access: { has: obj => "publicLighting" in obj, get: obj => obj.publicLighting, set: (obj, value) => { obj.publicLighting = value; } }, metadata: _metadata }, _publicLighting_initializers, _publicLighting_extraInitializers);
        __esDecorate(null, null, _iluminacao_decorators, { kind: "field", name: "iluminacao", static: false, private: false, access: { has: obj => "iluminacao" in obj, get: obj => obj.iluminacao, set: (obj, value) => { obj.iluminacao = value; } }, metadata: _metadata }, _iluminacao_initializers, _iluminacao_extraInitializers);
        __esDecorate(null, null, _garbageCollection_decorators, { kind: "field", name: "garbageCollection", static: false, private: false, access: { has: obj => "garbageCollection" in obj, get: obj => obj.garbageCollection, set: (obj, value) => { obj.garbageCollection = value; } }, metadata: _metadata }, _garbageCollection_initializers, _garbageCollection_extraInitializers);
        __esDecorate(null, null, _coleta_decorators, { kind: "field", name: "coleta", static: false, private: false, access: { has: obj => "coleta" in obj, get: obj => obj.coleta, set: (obj, value) => { obj.coleta = value; } }, metadata: _metadata }, _coleta_initializers, _coleta_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _updatedBy_decorators, { kind: "field", name: "updatedBy", static: false, private: false, access: { has: obj => "updatedBy" in obj, get: obj => obj.updatedBy, set: (obj, value) => { obj.updatedBy = value; } }, metadata: _metadata }, _updatedBy_initializers, _updatedBy_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParcelInfrastructure = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParcelInfrastructure = _classThis;
})();
exports.ParcelInfrastructure = ParcelInfrastructure;
exports.ParcelInfrastructureSchema = mongoose_1.SchemaFactory.createForClass(ParcelInfrastructure);
exports.ParcelInfrastructureSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
