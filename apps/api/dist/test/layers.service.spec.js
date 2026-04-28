"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const layers_service_1 = require("../src/modules/layers/layers.service");
const layers_repository_1 = require("../src/modules/layers/layers.repository");
const cache_service_1 = require("../src/modules/shared/cache.service");
describe('LayersService', () => {
    let service;
    const repository = {
        list: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    };
    const cacheService = {
        get: jest.fn(),
        set: jest.fn(),
        invalidateByPrefix: jest.fn(),
    };
    beforeEach(async () => {
        jest.resetAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                layers_service_1.LayersService,
                { provide: layers_repository_1.LayersRepository, useValue: repository },
                { provide: cache_service_1.CacheService, useValue: cacheService },
            ],
        }).compile();
        service = module.get(layers_service_1.LayersService);
    });
    it('imports a layer as external and preserves sourceUrl fields', async () => {
        const tenantId = '507f1f77bcf86cd799439011';
        repository.create.mockResolvedValue({
            toObject: () => ({
                _id: 'layer-1',
                tenantId,
                name: 'Camada Teste',
                group: 'Grupo',
                type: 'vector',
                source: 'external',
                tileUrl: 'https://example.com/test.geojson',
                dataUrl: 'https://example.com/test.geojson',
            }),
        });
        const result = await service.importLayer(tenantId, {
            name: 'Camada Teste',
            group: 'Grupo',
            sourceType: 'geojson_url',
            sourceUrl: 'https://example.com/test.geojson',
            geometryType: 'polygon',
        });
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            source: 'external',
            tileUrl: 'https://example.com/test.geojson',
            dataUrl: 'https://example.com/test.geojson',
            geometryType: 'polygon',
        }));
        expect(result).toMatchObject({
            id: 'layer-1',
            name: 'Camada Teste',
            source: 'external',
            tileUrl: 'https://example.com/test.geojson',
        });
    });
});
//# sourceMappingURL=layers.service.spec.js.map