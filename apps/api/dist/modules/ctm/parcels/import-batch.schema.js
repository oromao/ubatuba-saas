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
exports.ImportBatchSchema = exports.ImportBatch = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ImportBatch = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true, collection: 'import_batches' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _tenantId_decorators;
    let _tenantId_initializers = [];
    let _tenantId_extraInitializers = [];
    let _projectId_decorators;
    let _projectId_initializers = [];
    let _projectId_extraInitializers = [];
    let _sourceType_decorators;
    let _sourceType_initializers = [];
    let _sourceType_extraInitializers = [];
    let _fileName_decorators;
    let _fileName_initializers = [];
    let _fileName_extraInitializers = [];
    let _fileSize_decorators;
    let _fileSize_initializers = [];
    let _fileSize_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _totalRecords_decorators;
    let _totalRecords_initializers = [];
    let _totalRecords_extraInitializers = [];
    let _successCount_decorators;
    let _successCount_initializers = [];
    let _successCount_extraInitializers = [];
    let _errorCount_decorators;
    let _errorCount_initializers = [];
    let _errorCount_extraInitializers = [];
    let _warningCount_decorators;
    let _warningCount_initializers = [];
    let _warningCount_extraInitializers = [];
    let _errors_decorators;
    let _errors_initializers = [];
    let _errors_extraInitializers = [];
    let _warnings_decorators;
    let _warnings_initializers = [];
    let _warnings_extraInitializers = [];
    let _importedBy_decorators;
    let _importedBy_initializers = [];
    let _importedBy_extraInitializers = [];
    let _completedAt_decorators;
    let _completedAt_initializers = [];
    let _completedAt_extraInitializers = [];
    var ImportBatch = _classThis = class {
        constructor() {
            this.tenantId = __runInitializers(this, _tenantId_initializers, void 0);
            this.projectId = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
            this.sourceType = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _sourceType_initializers, void 0));
            this.fileName = (__runInitializers(this, _sourceType_extraInitializers), __runInitializers(this, _fileName_initializers, void 0));
            this.fileSize = (__runInitializers(this, _fileName_extraInitializers), __runInitializers(this, _fileSize_initializers, void 0));
            this.status = (__runInitializers(this, _fileSize_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.totalRecords = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _totalRecords_initializers, void 0));
            this.successCount = (__runInitializers(this, _totalRecords_extraInitializers), __runInitializers(this, _successCount_initializers, void 0));
            this.errorCount = (__runInitializers(this, _successCount_extraInitializers), __runInitializers(this, _errorCount_initializers, void 0));
            this.warningCount = (__runInitializers(this, _errorCount_extraInitializers), __runInitializers(this, _warningCount_initializers, void 0));
            this.errors = (__runInitializers(this, _warningCount_extraInitializers), __runInitializers(this, _errors_initializers, void 0));
            this.warnings = (__runInitializers(this, _errors_extraInitializers), __runInitializers(this, _warnings_initializers, void 0));
            this.importedBy = (__runInitializers(this, _warnings_extraInitializers), __runInitializers(this, _importedBy_initializers, void 0));
            this.completedAt = (__runInitializers(this, _importedBy_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
            __runInitializers(this, _completedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ImportBatch");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _tenantId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _projectId_decorators = [(0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId })];
        _sourceType_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _fileName_decorators = [(0, mongoose_1.Prop)()];
        _fileSize_decorators = [(0, mongoose_1.Prop)()];
        _status_decorators = [(0, mongoose_1.Prop)()];
        _totalRecords_decorators = [(0, mongoose_1.Prop)()];
        _successCount_decorators = [(0, mongoose_1.Prop)()];
        _errorCount_decorators = [(0, mongoose_1.Prop)()];
        _warningCount_decorators = [(0, mongoose_1.Prop)()];
        _errors_decorators = [(0, mongoose_1.Prop)({ type: [Object], default: [] })];
        _warnings_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
        _importedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId })];
        _completedAt_decorators = [(0, mongoose_1.Prop)()];
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: obj => "tenantId" in obj, get: obj => obj.tenantId, set: (obj, value) => { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: obj => "projectId" in obj, get: obj => obj.projectId, set: (obj, value) => { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
        __esDecorate(null, null, _sourceType_decorators, { kind: "field", name: "sourceType", static: false, private: false, access: { has: obj => "sourceType" in obj, get: obj => obj.sourceType, set: (obj, value) => { obj.sourceType = value; } }, metadata: _metadata }, _sourceType_initializers, _sourceType_extraInitializers);
        __esDecorate(null, null, _fileName_decorators, { kind: "field", name: "fileName", static: false, private: false, access: { has: obj => "fileName" in obj, get: obj => obj.fileName, set: (obj, value) => { obj.fileName = value; } }, metadata: _metadata }, _fileName_initializers, _fileName_extraInitializers);
        __esDecorate(null, null, _fileSize_decorators, { kind: "field", name: "fileSize", static: false, private: false, access: { has: obj => "fileSize" in obj, get: obj => obj.fileSize, set: (obj, value) => { obj.fileSize = value; } }, metadata: _metadata }, _fileSize_initializers, _fileSize_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _totalRecords_decorators, { kind: "field", name: "totalRecords", static: false, private: false, access: { has: obj => "totalRecords" in obj, get: obj => obj.totalRecords, set: (obj, value) => { obj.totalRecords = value; } }, metadata: _metadata }, _totalRecords_initializers, _totalRecords_extraInitializers);
        __esDecorate(null, null, _successCount_decorators, { kind: "field", name: "successCount", static: false, private: false, access: { has: obj => "successCount" in obj, get: obj => obj.successCount, set: (obj, value) => { obj.successCount = value; } }, metadata: _metadata }, _successCount_initializers, _successCount_extraInitializers);
        __esDecorate(null, null, _errorCount_decorators, { kind: "field", name: "errorCount", static: false, private: false, access: { has: obj => "errorCount" in obj, get: obj => obj.errorCount, set: (obj, value) => { obj.errorCount = value; } }, metadata: _metadata }, _errorCount_initializers, _errorCount_extraInitializers);
        __esDecorate(null, null, _warningCount_decorators, { kind: "field", name: "warningCount", static: false, private: false, access: { has: obj => "warningCount" in obj, get: obj => obj.warningCount, set: (obj, value) => { obj.warningCount = value; } }, metadata: _metadata }, _warningCount_initializers, _warningCount_extraInitializers);
        __esDecorate(null, null, _errors_decorators, { kind: "field", name: "errors", static: false, private: false, access: { has: obj => "errors" in obj, get: obj => obj.errors, set: (obj, value) => { obj.errors = value; } }, metadata: _metadata }, _errors_initializers, _errors_extraInitializers);
        __esDecorate(null, null, _warnings_decorators, { kind: "field", name: "warnings", static: false, private: false, access: { has: obj => "warnings" in obj, get: obj => obj.warnings, set: (obj, value) => { obj.warnings = value; } }, metadata: _metadata }, _warnings_initializers, _warnings_extraInitializers);
        __esDecorate(null, null, _importedBy_decorators, { kind: "field", name: "importedBy", static: false, private: false, access: { has: obj => "importedBy" in obj, get: obj => obj.importedBy, set: (obj, value) => { obj.importedBy = value; } }, metadata: _metadata }, _importedBy_initializers, _importedBy_extraInitializers);
        __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: obj => "completedAt" in obj, get: obj => obj.completedAt, set: (obj, value) => { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ImportBatch = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ImportBatch = _classThis;
})();
exports.ImportBatch = ImportBatch;
exports.ImportBatchSchema = mongoose_1.SchemaFactory.createForClass(ImportBatch);
exports.ImportBatchSchema.index({ tenantId: 1, projectId: 1, status: 1 });
exports.ImportBatchSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });
