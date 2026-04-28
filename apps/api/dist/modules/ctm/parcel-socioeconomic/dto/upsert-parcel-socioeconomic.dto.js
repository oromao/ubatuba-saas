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
exports.UpsertParcelSocioeconomicDto = void 0;
const class_validator_1 = require("class-validator");
let UpsertParcelSocioeconomicDto = (() => {
    var _a;
    let _incomeBracket_decorators;
    let _incomeBracket_initializers = [];
    let _incomeBracket_extraInitializers = [];
    let _faixaRenda_decorators;
    let _faixaRenda_initializers = [];
    let _faixaRenda_extraInitializers = [];
    let _residents_decorators;
    let _residents_initializers = [];
    let _residents_extraInitializers = [];
    let _moradores_decorators;
    let _moradores_initializers = [];
    let _moradores_extraInitializers = [];
    let _vulnerabilityIndicator_decorators;
    let _vulnerabilityIndicator_initializers = [];
    let _vulnerabilityIndicator_extraInitializers = [];
    let _vulnerabilidade_decorators;
    let _vulnerabilidade_initializers = [];
    let _vulnerabilidade_extraInitializers = [];
    return _a = class UpsertParcelSocioeconomicDto {
            constructor() {
                this.incomeBracket = __runInitializers(this, _incomeBracket_initializers, void 0);
                this.faixaRenda = (__runInitializers(this, _incomeBracket_extraInitializers), __runInitializers(this, _faixaRenda_initializers, void 0));
                this.residents = (__runInitializers(this, _faixaRenda_extraInitializers), __runInitializers(this, _residents_initializers, void 0));
                this.moradores = (__runInitializers(this, _residents_extraInitializers), __runInitializers(this, _moradores_initializers, void 0));
                this.vulnerabilityIndicator = (__runInitializers(this, _moradores_extraInitializers), __runInitializers(this, _vulnerabilityIndicator_initializers, void 0));
                this.vulnerabilidade = (__runInitializers(this, _vulnerabilityIndicator_extraInitializers), __runInitializers(this, _vulnerabilidade_initializers, void 0));
                __runInitializers(this, _vulnerabilidade_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _incomeBracket_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _faixaRenda_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _residents_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _moradores_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _vulnerabilityIndicator_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _vulnerabilidade_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _incomeBracket_decorators, { kind: "field", name: "incomeBracket", static: false, private: false, access: { has: obj => "incomeBracket" in obj, get: obj => obj.incomeBracket, set: (obj, value) => { obj.incomeBracket = value; } }, metadata: _metadata }, _incomeBracket_initializers, _incomeBracket_extraInitializers);
            __esDecorate(null, null, _faixaRenda_decorators, { kind: "field", name: "faixaRenda", static: false, private: false, access: { has: obj => "faixaRenda" in obj, get: obj => obj.faixaRenda, set: (obj, value) => { obj.faixaRenda = value; } }, metadata: _metadata }, _faixaRenda_initializers, _faixaRenda_extraInitializers);
            __esDecorate(null, null, _residents_decorators, { kind: "field", name: "residents", static: false, private: false, access: { has: obj => "residents" in obj, get: obj => obj.residents, set: (obj, value) => { obj.residents = value; } }, metadata: _metadata }, _residents_initializers, _residents_extraInitializers);
            __esDecorate(null, null, _moradores_decorators, { kind: "field", name: "moradores", static: false, private: false, access: { has: obj => "moradores" in obj, get: obj => obj.moradores, set: (obj, value) => { obj.moradores = value; } }, metadata: _metadata }, _moradores_initializers, _moradores_extraInitializers);
            __esDecorate(null, null, _vulnerabilityIndicator_decorators, { kind: "field", name: "vulnerabilityIndicator", static: false, private: false, access: { has: obj => "vulnerabilityIndicator" in obj, get: obj => obj.vulnerabilityIndicator, set: (obj, value) => { obj.vulnerabilityIndicator = value; } }, metadata: _metadata }, _vulnerabilityIndicator_initializers, _vulnerabilityIndicator_extraInitializers);
            __esDecorate(null, null, _vulnerabilidade_decorators, { kind: "field", name: "vulnerabilidade", static: false, private: false, access: { has: obj => "vulnerabilidade" in obj, get: obj => obj.vulnerabilidade, set: (obj, value) => { obj.vulnerabilidade = value; } }, metadata: _metadata }, _vulnerabilidade_initializers, _vulnerabilidade_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpsertParcelSocioeconomicDto = UpsertParcelSocioeconomicDto;
