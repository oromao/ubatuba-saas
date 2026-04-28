"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pgv_simulations_service_1 = require("../src/modules/pgv/simulations/pgv-simulations.service");
const projectsService = {
    resolveProjectId: jest.fn().mockResolvedValue('507f1f77bcf86cd799439014'),
};
const parcelsRepository = {
    list: jest.fn().mockResolvedValue([
        {
            id: 'parcel-1',
            sqlu: 'SQLU-1',
            enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua A' },
        },
    ]),
};
const parcelBuildingsRepository = {
    findByParcel: jest.fn().mockResolvedValue({
        uso: 'RESIDENCIAL',
        padraoConstrutivo: 'MÉDIO',
    }),
};
const valuationsService = {
    calculate: jest.fn().mockResolvedValue({
        landValue: 100,
        constructionValue: 50,
        totalValue: 150,
    }),
};
const zonesRepository = {
    findById: jest.fn().mockResolvedValue({ code: 'Z1' }),
};
const facesRepository = {
    findById: jest.fn().mockResolvedValue({ code: 'F1' }),
};
const scenariosRepository = {
    create: jest.fn().mockResolvedValue({}),
    list: jest.fn().mockResolvedValue([]),
};
describe('PgvSimulationsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('builds a fiscal simulation scenario and persists it', async () => {
        const service = new pgv_simulations_service_1.PgvSimulationsService(projectsService, parcelsRepository, parcelBuildingsRepository, valuationsService, zonesRepository, facesRepository, scenariosRepository);
        const result = await service.simulate('507f1f77bcf86cd799439012', {
            projectId: '507f1f77bcf86cd799439011',
            name: 'Cenario demo',
            zoneId: 'zone-1',
            faceId: 'face-1',
            q: 'Centro',
            proposedLandMultiplier: 1.1,
            proposedConstructionMultiplier: 1.05,
            persist: true,
        }, '507f1f77bcf86cd799439013');
        expect(result.summary.parcelsEvaluated).toBe(1);
        expect(result.summary.totalDelta).toBeGreaterThan(0);
        expect(result.highlights.withPositiveImpact).toBe(1);
        expect(scenariosRepository.create).toHaveBeenCalled();
    });
});
//# sourceMappingURL=pgv-simulations.service.spec.js.map