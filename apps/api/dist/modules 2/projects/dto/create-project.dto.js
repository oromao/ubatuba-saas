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
exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
let CreateProjectDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _slug_decorators;
    let _slug_initializers = [];
    let _slug_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _defaultCenter_decorators;
    let _defaultCenter_initializers = [];
    let _defaultCenter_extraInitializers = [];
    let _defaultBbox_decorators;
    let _defaultBbox_initializers = [];
    let _defaultBbox_extraInitializers = [];
    let _defaultZoom_decorators;
    let _defaultZoom_initializers = [];
    let _defaultZoom_extraInitializers = [];
    return _a = class CreateProjectDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.slug = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
                this.description = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.defaultCenter = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _defaultCenter_initializers, void 0));
                this.defaultBbox = (__runInitializers(this, _defaultCenter_extraInitializers), __runInitializers(this, _defaultBbox_initializers, void 0));
                this.defaultZoom = (__runInitializers(this, _defaultBbox_extraInitializers), __runInitializers(this, _defaultZoom_initializers, void 0));
                __runInitializers(this, _defaultZoom_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _slug_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _defaultCenter_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMinSize)(2), (0, class_validator_1.ArrayMaxSize)(2), (0, class_validator_1.IsNumber)({}, { each: true }), (0, class_validator_1.IsOptional)()];
            _defaultBbox_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMinSize)(4), (0, class_validator_1.ArrayMaxSize)(4), (0, class_validator_1.IsNumber)({}, { each: true }), (0, class_validator_1.IsOptional)()];
            _defaultZoom_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: obj => "slug" in obj, get: obj => obj.slug, set: (obj, value) => { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _defaultCenter_decorators, { kind: "field", name: "defaultCenter", static: false, private: false, access: { has: obj => "defaultCenter" in obj, get: obj => obj.defaultCenter, set: (obj, value) => { obj.defaultCenter = value; } }, metadata: _metadata }, _defaultCenter_initializers, _defaultCenter_extraInitializers);
            __esDecorate(null, null, _defaultBbox_decorators, { kind: "field", name: "defaultBbox", static: false, private: false, access: { has: obj => "defaultBbox" in obj, get: obj => obj.defaultBbox, set: (obj, value) => { obj.defaultBbox = value; } }, metadata: _metadata }, _defaultBbox_initializers, _defaultBbox_extraInitializers);
            __esDecorate(null, null, _defaultZoom_decorators, { kind: "field", name: "defaultZoom", static: false, private: false, access: { has: obj => "defaultZoom" in obj, get: obj => obj.defaultZoom, set: (obj, value) => { obj.defaultZoom = value; } }, metadata: _metadata }, _defaultZoom_initializers, _defaultZoom_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateProjectDto = CreateProjectDto;
