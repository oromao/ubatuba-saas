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
exports.UpdateParcelDto = void 0;
const class_validator_1 = require("class-validator");
let UpdateParcelDto = (() => {
    var _a;
    let _sqlu_decorators;
    let _sqlu_initializers = [];
    let _sqlu_extraInitializers = [];
    let _inscription_decorators;
    let _inscription_initializers = [];
    let _inscription_extraInitializers = [];
    let _mainAddress_decorators;
    let _mainAddress_initializers = [];
    let _mainAddress_extraInitializers = [];
    let _inscricaoImobiliaria_decorators;
    let _inscricaoImobiliaria_initializers = [];
    let _inscricaoImobiliaria_extraInitializers = [];
    let _enderecoPrincipal_decorators;
    let _enderecoPrincipal_initializers = [];
    let _enderecoPrincipal_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _statusCadastral_decorators;
    let _statusCadastral_initializers = [];
    let _statusCadastral_extraInitializers = [];
    let _observacoes_decorators;
    let _observacoes_initializers = [];
    let _observacoes_extraInitializers = [];
    let _workflowStatus_decorators;
    let _workflowStatus_initializers = [];
    let _workflowStatus_extraInitializers = [];
    let _logradouroId_decorators;
    let _logradouroId_initializers = [];
    let _logradouroId_extraInitializers = [];
    let _zoneId_decorators;
    let _zoneId_initializers = [];
    let _zoneId_extraInitializers = [];
    let _faceId_decorators;
    let _faceId_initializers = [];
    let _faceId_extraInitializers = [];
    let _geometry_decorators;
    let _geometry_initializers = [];
    let _geometry_extraInitializers = [];
    return _a = class UpdateParcelDto {
            constructor() {
                this.sqlu = __runInitializers(this, _sqlu_initializers, void 0);
                this.inscription = (__runInitializers(this, _sqlu_extraInitializers), __runInitializers(this, _inscription_initializers, void 0));
                this.mainAddress = (__runInitializers(this, _inscription_extraInitializers), __runInitializers(this, _mainAddress_initializers, void 0));
                this.inscricaoImobiliaria = (__runInitializers(this, _mainAddress_extraInitializers), __runInitializers(this, _inscricaoImobiliaria_initializers, void 0));
                this.enderecoPrincipal = (__runInitializers(this, _inscricaoImobiliaria_extraInitializers), __runInitializers(this, _enderecoPrincipal_initializers, void 0));
                this.status = (__runInitializers(this, _enderecoPrincipal_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.statusCadastral = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _statusCadastral_initializers, void 0));
                this.observacoes = (__runInitializers(this, _statusCadastral_extraInitializers), __runInitializers(this, _observacoes_initializers, void 0));
                this.workflowStatus = (__runInitializers(this, _observacoes_extraInitializers), __runInitializers(this, _workflowStatus_initializers, void 0));
                this.logradouroId = (__runInitializers(this, _workflowStatus_extraInitializers), __runInitializers(this, _logradouroId_initializers, void 0));
                this.zoneId = (__runInitializers(this, _logradouroId_extraInitializers), __runInitializers(this, _zoneId_initializers, void 0));
                this.faceId = (__runInitializers(this, _zoneId_extraInitializers), __runInitializers(this, _faceId_initializers, void 0));
                this.geometry = (__runInitializers(this, _faceId_extraInitializers), __runInitializers(this, _geometry_initializers, void 0));
                __runInitializers(this, _geometry_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _sqlu_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _inscription_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _mainAddress_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _inscricaoImobiliaria_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _enderecoPrincipal_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            _status_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _statusCadastral_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _observacoes_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _workflowStatus_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _logradouroId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _zoneId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _faceId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _geometry_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _sqlu_decorators, { kind: "field", name: "sqlu", static: false, private: false, access: { has: obj => "sqlu" in obj, get: obj => obj.sqlu, set: (obj, value) => { obj.sqlu = value; } }, metadata: _metadata }, _sqlu_initializers, _sqlu_extraInitializers);
            __esDecorate(null, null, _inscription_decorators, { kind: "field", name: "inscription", static: false, private: false, access: { has: obj => "inscription" in obj, get: obj => obj.inscription, set: (obj, value) => { obj.inscription = value; } }, metadata: _metadata }, _inscription_initializers, _inscription_extraInitializers);
            __esDecorate(null, null, _mainAddress_decorators, { kind: "field", name: "mainAddress", static: false, private: false, access: { has: obj => "mainAddress" in obj, get: obj => obj.mainAddress, set: (obj, value) => { obj.mainAddress = value; } }, metadata: _metadata }, _mainAddress_initializers, _mainAddress_extraInitializers);
            __esDecorate(null, null, _inscricaoImobiliaria_decorators, { kind: "field", name: "inscricaoImobiliaria", static: false, private: false, access: { has: obj => "inscricaoImobiliaria" in obj, get: obj => obj.inscricaoImobiliaria, set: (obj, value) => { obj.inscricaoImobiliaria = value; } }, metadata: _metadata }, _inscricaoImobiliaria_initializers, _inscricaoImobiliaria_extraInitializers);
            __esDecorate(null, null, _enderecoPrincipal_decorators, { kind: "field", name: "enderecoPrincipal", static: false, private: false, access: { has: obj => "enderecoPrincipal" in obj, get: obj => obj.enderecoPrincipal, set: (obj, value) => { obj.enderecoPrincipal = value; } }, metadata: _metadata }, _enderecoPrincipal_initializers, _enderecoPrincipal_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _statusCadastral_decorators, { kind: "field", name: "statusCadastral", static: false, private: false, access: { has: obj => "statusCadastral" in obj, get: obj => obj.statusCadastral, set: (obj, value) => { obj.statusCadastral = value; } }, metadata: _metadata }, _statusCadastral_initializers, _statusCadastral_extraInitializers);
            __esDecorate(null, null, _observacoes_decorators, { kind: "field", name: "observacoes", static: false, private: false, access: { has: obj => "observacoes" in obj, get: obj => obj.observacoes, set: (obj, value) => { obj.observacoes = value; } }, metadata: _metadata }, _observacoes_initializers, _observacoes_extraInitializers);
            __esDecorate(null, null, _workflowStatus_decorators, { kind: "field", name: "workflowStatus", static: false, private: false, access: { has: obj => "workflowStatus" in obj, get: obj => obj.workflowStatus, set: (obj, value) => { obj.workflowStatus = value; } }, metadata: _metadata }, _workflowStatus_initializers, _workflowStatus_extraInitializers);
            __esDecorate(null, null, _logradouroId_decorators, { kind: "field", name: "logradouroId", static: false, private: false, access: { has: obj => "logradouroId" in obj, get: obj => obj.logradouroId, set: (obj, value) => { obj.logradouroId = value; } }, metadata: _metadata }, _logradouroId_initializers, _logradouroId_extraInitializers);
            __esDecorate(null, null, _zoneId_decorators, { kind: "field", name: "zoneId", static: false, private: false, access: { has: obj => "zoneId" in obj, get: obj => obj.zoneId, set: (obj, value) => { obj.zoneId = value; } }, metadata: _metadata }, _zoneId_initializers, _zoneId_extraInitializers);
            __esDecorate(null, null, _faceId_decorators, { kind: "field", name: "faceId", static: false, private: false, access: { has: obj => "faceId" in obj, get: obj => obj.faceId, set: (obj, value) => { obj.faceId = value; } }, metadata: _metadata }, _faceId_initializers, _faceId_extraInitializers);
            __esDecorate(null, null, _geometry_decorators, { kind: "field", name: "geometry", static: false, private: false, access: { has: obj => "geometry" in obj, get: obj => obj.geometry, set: (obj, value) => { obj.geometry = value; } }, metadata: _metadata }, _geometry_initializers, _geometry_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateParcelDto = UpdateParcelDto;
