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
exports.ParcelsRepository = void 0;
const common_1 = require("@nestjs/common");
const object_id_1 = require("../../../common/utils/object-id");
let ParcelsRepository = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ParcelsRepository = _classThis = class {
        constructor(model) {
            this.model = model;
        }
        list(tenantId, filters) {
            const query = {
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: (0, object_id_1.asObjectId)(filters.projectId),
            };
            if (filters.sqlu)
                query.sqlu = filters.sqlu;
            if (filters.inscription)
                query.inscription = filters.inscription;
            if (filters.inscricaoImobiliaria) {
                query.inscricaoImobiliaria = filters.inscricaoImobiliaria;
            }
            if (filters.status)
                query.status = filters.status;
            if (filters.workflowStatus)
                query.workflowStatus = filters.workflowStatus;
            if (filters.zoneId)
                query.zoneId = (0, object_id_1.asObjectId)(filters.zoneId);
            if (filters.faceId)
                query.faceId = (0, object_id_1.asObjectId)(filters.faceId);
            if (filters.sourceType)
                query.sourceType = filters.sourceType;
            if (filters.isOfficial !== undefined)
                query.isOfficial = filters.isOfficial;
            if (filters.zoneamento)
                query.zoneamento = filters.zoneamento;
            if (filters.statusIPTU)
                query.statusIPTU = filters.statusIPTU;
            if (filters.q) {
                const term = filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(term, 'i');
                query.$or = [
                    { sqlu: regex },
                    { inscription: regex },
                    { inscricaoImobiliaria: regex },
                    { mainAddress: regex },
                    { 'enderecoPrincipal.logradouro': regex },
                    { 'enderecoPrincipal.bairro': regex },
                    { 'enderecoPrincipal.cidade': regex },
                ];
            }
            if (filters.bbox) {
                const [minLng, minLat, maxLng, maxLat] = filters.bbox.split(',').map(Number);
                query.geometry = {
                    $geoWithin: {
                        $box: [
                            [minLng, minLat],
                            [maxLng, maxLat],
                        ],
                    },
                };
            }
            const limit = filters.bbox ? 2000 : 0;
            const q = this.model.find(query).sort({ sqlu: 1 });
            if (limit > 0)
                q.limit(limit);
            return q.exec();
        }
        findById(tenantId, projectId, id) {
            return this.model
                .findOne({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
                .exec();
        }
        findBySqlu(tenantId, projectId, sqlu) {
            return this.model
                .findOne({ sqlu, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
                .exec();
        }
        findByInscription(tenantId, projectId, inscription) {
            return this.model
                .findOne({
                $or: [
                    { inscricaoImobiliaria: inscription },
                    { inscription: inscription },
                ],
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: (0, object_id_1.asObjectId)(projectId)
            })
                .exec();
        }
        create(data) {
            return this.model.create(data);
        }
        update(tenantId, projectId, id, data) {
            return this.model
                .findOneAndUpdate({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, data, { new: true })
                .exec();
        }
        delete(tenantId, projectId, id) {
            return this.model.deleteOne({
                _id: id,
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: (0, object_id_1.asObjectId)(projectId),
            }).exec();
        }
    };
    __setFunctionName(_classThis, "ParcelsRepository");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParcelsRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParcelsRepository = _classThis;
})();
exports.ParcelsRepository = ParcelsRepository;
