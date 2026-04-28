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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const object_id_1 = require("../../common/utils/object-id");
let ProjectsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProjectsService = _classThis = class {
        constructor(projectsRepository) {
            this.projectsRepository = projectsRepository;
        }
        list(tenantId) {
            return this.projectsRepository.list(tenantId);
        }
        findById(tenantId, id) {
            return this.projectsRepository.findById(tenantId, id);
        }
        async resolveProjectId(tenantId, projectId) {
            if (projectId) {
                return (0, object_id_1.asObjectId)(projectId);
            }
            const existing = await this.projectsRepository.findDefault(tenantId);
            if (existing) {
                return (0, object_id_1.asObjectId)(existing.id);
            }
            const created = await this.projectsRepository.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                name: 'Projeto Demo',
                slug: 'demo',
                isDefault: true,
            });
            return (0, object_id_1.asObjectId)(created.id);
        }
        async create(tenantId, dto, userId) {
            return this.projectsRepository.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                defaultCenter: dto.defaultCenter,
                defaultBbox: dto.defaultBbox,
                defaultZoom: dto.defaultZoom,
                createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
            });
        }
        update(tenantId, id, dto) {
            return this.projectsRepository.update(tenantId, id, {
                name: dto.name,
                description: dto.description,
                defaultCenter: dto.defaultCenter,
                defaultBbox: dto.defaultBbox,
                defaultZoom: dto.defaultZoom,
            });
        }
    };
    __setFunctionName(_classThis, "ProjectsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProjectsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProjectsService = _classThis;
})();
exports.ProjectsService = ProjectsService;
