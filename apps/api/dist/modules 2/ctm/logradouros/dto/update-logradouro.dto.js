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
exports.UpdateLogradouroDto = void 0;
const class_validator_1 = require("class-validator");
let UpdateLogradouroDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _nome_decorators;
    let _nome_initializers = [];
    let _nome_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _tipo_decorators;
    let _tipo_initializers = [];
    let _tipo_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _codigo_decorators;
    let _codigo_initializers = [];
    let _codigo_extraInitializers = [];
    let _geometry_decorators;
    let _geometry_initializers = [];
    let _geometry_extraInitializers = [];
    return _a = class UpdateLogradouroDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.nome = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _nome_initializers, void 0));
                this.type = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.tipo = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
                this.code = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _code_initializers, void 0));
                this.codigo = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _codigo_initializers, void 0));
                this.geometry = (__runInitializers(this, _codigo_extraInitializers), __runInitializers(this, _geometry_initializers, void 0));
                __runInitializers(this, _geometry_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _nome_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _type_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _tipo_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _code_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _codigo_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _geometry_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: obj => "nome" in obj, get: obj => obj.nome, set: (obj, value) => { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: obj => "tipo" in obj, get: obj => obj.tipo, set: (obj, value) => { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _codigo_decorators, { kind: "field", name: "codigo", static: false, private: false, access: { has: obj => "codigo" in obj, get: obj => obj.codigo, set: (obj, value) => { obj.codigo = value; } }, metadata: _metadata }, _codigo_initializers, _codigo_extraInitializers);
            __esDecorate(null, null, _geometry_decorators, { kind: "field", name: "geometry", static: false, private: false, access: { has: obj => "geometry" in obj, get: obj => obj.geometry, set: (obj, value) => { obj.geometry = value; } }, metadata: _metadata }, _geometry_initializers, _geometry_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateLogradouroDto = UpdateLogradouroDto;
