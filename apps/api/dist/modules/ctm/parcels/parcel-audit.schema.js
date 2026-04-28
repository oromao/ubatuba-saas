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
exports.ParcelAuditLogSchema = exports.ParcelAuditLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ParcelAuditLog = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true, collection: 'parcel_audit_logs' })];
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
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    let _before_decorators;
    let _before_initializers = [];
    let _before_extraInitializers = [];
    let _after_decorators;
    let _after_initializers = [];
    let _after_extraInitializers = [];
    let _diff_decorators;
    let _diff_initializers = [];
    let _diff_extraInitializers = [];
    let _actorId_decorators;
    let _actorId_initializers = [];
    let _actorId_extraInitializers = [];
    var ParcelAuditLog = _classThis = class {
        constructor() {
            this.tenantId = __runInitializers(this, _tenantId_initializers, void 0);
            this.projectId = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
            this.parcelId = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _parcelId_initializers, void 0));
            this.action = (__runInitializers(this, _parcelId_extraInitializers), __runInitializers(this, _action_initializers, void 0));
            this.before = (__runInitializers(this, _action_extraInitializers), __runInitializers(this, _before_initializers, void 0));
            this.after = (__runInitializers(this, _before_extraInitializers), __runInitializers(this, _after_initializers, void 0));
            this.diff = (__runInitializers(this, _after_extraInitializers), __runInitializers(this, _diff_initializers, void 0));
            this.actorId = (__runInitializers(this, _diff_extraInitializers), __runInitializers(this, _actorId_initializers, void 0));
            __runInitializers(this, _actorId_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ParcelAuditLog");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _tenantId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _projectId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _parcelId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _action_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _before_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _after_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _diff_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _actorId_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: obj => "projectId" in obj, get: obj => obj.projectId, set: (obj, value) => { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
        __esDecorate(null, null, _parcelId_decorators, { kind: "field", name: "parcelId", static: false, private: false, access: { has: obj => "parcelId" in obj, get: obj => obj.parcelId, set: (obj, value) => { obj.parcelId = value; } }, metadata: _metadata }, _parcelId_initializers, _parcelId_extraInitializers);
        __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
        __esDecorate(null, null, _before_decorators, { kind: "field", name: "before", static: false, private: false, access: { has: obj => "before" in obj, get: obj => obj.before, set: (obj, value) => { obj.before = value; } }, metadata: _metadata }, _before_initializers, _before_extraInitializers);
        __esDecorate(null, null, _after_decorators, { kind: "field", name: "after", static: false, private: false, access: { has: obj => "after" in obj, get: obj => obj.after, set: (obj, value) => { obj.after = value; } }, metadata: _metadata }, _after_initializers, _after_extraInitializers);
        __esDecorate(null, null, _diff_decorators, { kind: "field", name: "diff", static: false, private: false, access: { has: obj => "diff" in obj, get: obj => obj.diff, set: (obj, value) => { obj.diff = value; } }, metadata: _metadata }, _diff_initializers, _diff_extraInitializers);
        __esDecorate(null, null, _actorId_decorators, { kind: "field", name: "actorId", static: false, private: false, access: { has: obj => "actorId" in obj, get: obj => obj.actorId, set: (obj, value) => { obj.actorId = value; } }, metadata: _metadata }, _actorId_initializers, _actorId_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParcelAuditLog = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParcelAuditLog = _classThis;
})();
exports.ParcelAuditLog = ParcelAuditLog;
exports.ParcelAuditLogSchema = mongoose_1.SchemaFactory.createForClass(ParcelAuditLog);
exports.ParcelAuditLogSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, createdAt: -1 });
