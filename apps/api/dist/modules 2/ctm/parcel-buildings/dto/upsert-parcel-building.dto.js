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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpsertParcelBuildingDto = void 0;
const class_validator_1 = require("class-validator");
let UpsertParcelBuildingDto = (() => {
    var _a;
    let _useType_decorators;
    let _useType_initializers = [];
    let _useType_extraInitializers = [];
    let _uso_decorators;
    let _uso_initializers = [];
    let _uso_extraInitializers = [];
    let _constructionStandard_decorators;
    let _constructionStandard_initializers = [];
    let _constructionStandard_extraInitializers = [];
    let _padraoConstrutivo_decorators;
    let _padraoConstrutivo_initializers = [];
    let _padraoConstrutivo_extraInitializers = [];
    let _builtArea_decorators;
    let _builtArea_initializers = [];
    let _builtArea_extraInitializers = [];
    let _areaConstruida_decorators;
    let _areaConstruida_initializers = [];
    let _areaConstruida_extraInitializers = [];
    let _floors_decorators;
    let _floors_initializers = [];
    let _floors_extraInitializers = [];
    let _pavimentos_decorators;
    let _pavimentos_initializers = [];
    let _pavimentos_extraInitializers = [];
    let _constructionYear_decorators;
    let _constructionYear_initializers = [];
    let _constructionYear_extraInitializers = [];
    let _anoConstrucao_decorators;
    let _anoConstrucao_initializers = [];
    let _anoConstrucao_extraInitializers = [];
    let _occupancyType_decorators;
    let _occupancyType_initializers = [];
    let _occupancyType_extraInitializers = [];
    let _tipoOcupacao_decorators;
    let _tipoOcupacao_initializers = [];
    let _tipoOcupacao_extraInitializers = [];
    return _a = class UpsertParcelBuildingDto {
            constructor() {
                this.useType = __runInitializers(this, _useType_initializers, void 0);
                this.uso = (__runInitializers(this, _useType_extraInitializers), __runInitializers(this, _uso_initializers, void 0));
                this.constructionStandard = (__runInitializers(this, _uso_extraInitializers), __runInitializers(this, _constructionStandard_initializers, void 0));
                this.padraoConstrutivo = (__runInitializers(this, _constructionStandard_extraInitializers), __runInitializers(this, _padraoConstrutivo_initializers, void 0));
                this.builtArea = (__runInitializers(this, _padraoConstrutivo_extraInitializers), __runInitializers(this, _builtArea_initializers, void 0));
                this.areaConstruida = (__runInitializers(this, _builtArea_extraInitializers), __runInitializers(this, _areaConstruida_initializers, void 0));
                this.floors = (__runInitializers(this, _areaConstruida_extraInitializers), __runInitializers(this, _floors_initializers, void 0));
                this.pavimentos = (__runInitializers(this, _floors_extraInitializers), __runInitializers(this, _pavimentos_initializers, void 0));
                this.constructionYear = (__runInitializers(this, _pavimentos_extraInitializers), __runInitializers(this, _constructionYear_initializers, void 0));
                this.anoConstrucao = (__runInitializers(this, _constructionYear_extraInitializers), __runInitializers(this, _anoConstrucao_initializers, void 0));
                this.occupancyType = (__runInitializers(this, _anoConstrucao_extraInitializers), __runInitializers(this, _occupancyType_initializers, void 0));
                this.tipoOcupacao = (__runInitializers(this, _occupancyType_extraInitializers), __runInitializers(this, _tipoOcupacao_initializers, void 0));
                __runInitializers(this, _tipoOcupacao_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _useType_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _uso_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _constructionStandard_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _padraoConstrutivo_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _builtArea_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _areaConstruida_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _floors_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _pavimentos_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _constructionYear_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _anoConstrucao_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _occupancyType_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _tipoOcupacao_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _useType_decorators, { kind: "field", name: "useType", static: false, private: false, access: { has: obj => "useType" in obj, get: obj => obj.useType, set: (obj, value) => { obj.useType = value; } }, metadata: _metadata }, _useType_initializers, _useType_extraInitializers);
            __esDecorate(null, null, _uso_decorators, { kind: "field", name: "uso", static: false, private: false, access: { has: obj => "uso" in obj, get: obj => obj.uso, set: (obj, value) => { obj.uso = value; } }, metadata: _metadata }, _uso_initializers, _uso_extraInitializers);
            __esDecorate(null, null, _constructionStandard_decorators, { kind: "field", name: "constructionStandard", static: false, private: false, access: { has: obj => "constructionStandard" in obj, get: obj => obj.constructionStandard, set: (obj, value) => { obj.constructionStandard = value; } }, metadata: _metadata }, _constructionStandard_initializers, _constructionStandard_extraInitializers);
            __esDecorate(null, null, _padraoConstrutivo_decorators, { kind: "field", name: "padraoConstrutivo", static: false, private: false, access: { has: obj => "padraoConstrutivo" in obj, get: obj => obj.padraoConstrutivo, set: (obj, value) => { obj.padraoConstrutivo = value; } }, metadata: _metadata }, _padraoConstrutivo_initializers, _padraoConstrutivo_extraInitializers);
            __esDecorate(null, null, _builtArea_decorators, { kind: "field", name: "builtArea", static: false, private: false, access: { has: obj => "builtArea" in obj, get: obj => obj.builtArea, set: (obj, value) => { obj.builtArea = value; } }, metadata: _metadata }, _builtArea_initializers, _builtArea_extraInitializers);
            __esDecorate(null, null, _areaConstruida_decorators, { kind: "field", name: "areaConstruida", static: false, private: false, access: { has: obj => "areaConstruida" in obj, get: obj => obj.areaConstruida, set: (obj, value) => { obj.areaConstruida = value; } }, metadata: _metadata }, _areaConstruida_initializers, _areaConstruida_extraInitializers);
            __esDecorate(null, null, _floors_decorators, { kind: "field", name: "floors", static: false, private: false, access: { has: obj => "floors" in obj, get: obj => obj.floors, set: (obj, value) => { obj.floors = value; } }, metadata: _metadata }, _floors_initializers, _floors_extraInitializers);
            __esDecorate(null, null, _pavimentos_decorators, { kind: "field", name: "pavimentos", static: false, private: false, access: { has: obj => "pavimentos" in obj, get: obj => obj.pavimentos, set: (obj, value) => { obj.pavimentos = value; } }, metadata: _metadata }, _pavimentos_initializers, _pavimentos_extraInitializers);
            __esDecorate(null, null, _constructionYear_decorators, { kind: "field", name: "constructionYear", static: false, private: false, access: { has: obj => "constructionYear" in obj, get: obj => obj.constructionYear, set: (obj, value) => { obj.constructionYear = value; } }, metadata: _metadata }, _constructionYear_initializers, _constructionYear_extraInitializers);
            __esDecorate(null, null, _anoConstrucao_decorators, { kind: "field", name: "anoConstrucao", static: false, private: false, access: { has: obj => "anoConstrucao" in obj, get: obj => obj.anoConstrucao, set: (obj, value) => { obj.anoConstrucao = value; } }, metadata: _metadata }, _anoConstrucao_initializers, _anoConstrucao_extraInitializers);
            __esDecorate(null, null, _occupancyType_decorators, { kind: "field", name: "occupancyType", static: false, private: false, access: { has: obj => "occupancyType" in obj, get: obj => obj.occupancyType, set: (obj, value) => { obj.occupancyType = value; } }, metadata: _metadata }, _occupancyType_initializers, _occupancyType_extraInitializers);
            __esDecorate(null, null, _tipoOcupacao_decorators, { kind: "field", name: "tipoOcupacao", static: false, private: false, access: { has: obj => "tipoOcupacao" in obj, get: obj => obj.tipoOcupacao, set: (obj, value) => { obj.tipoOcupacao = value; } }, metadata: _metadata }, _tipoOcupacao_initializers, _tipoOcupacao_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpsertParcelBuildingDto = UpsertParcelBuildingDto;
