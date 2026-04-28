"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const projects_service_1 = require("../src/modules/projects/projects.service");
const projects_repository_1 = require("../src/modules/projects/projects.repository");
const mongoose_1 = require("mongoose");
describe('Multi-tenant Isolation Logic', () => {
    let service;
    let repository;
    const mockRepository = {
        list: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findDefault: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                projects_service_1.ProjectsService,
                {
                    provide: projects_repository_1.ProjectsRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
        repository = module.get(projects_repository_1.ProjectsRepository);
    });
    it('should filter projects by tenantId in list()', async () => {
        const tenantId = new mongoose_1.Types.ObjectId().toHexString();
        await service.list(tenantId);
        expect(repository.list).toHaveBeenCalledWith(tenantId);
    });
    it('should filter projects by tenantId in findById()', async () => {
        const tenantId = new mongoose_1.Types.ObjectId().toHexString();
        const projectId = new mongoose_1.Types.ObjectId().toHexString();
        await service.findById(tenantId, projectId);
        expect(repository.findById).toHaveBeenCalledWith(tenantId, projectId);
    });
    it('should enforce tenantId ownership when creating projects', async () => {
        const tenantId = new mongoose_1.Types.ObjectId().toHexString();
        const dto = { name: 'Projeto Teste', slug: 'teste' };
        await service.create(tenantId, dto);
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            tenantId: expect.anything(),
            name: dto.name,
        }));
    });
});
//# sourceMappingURL=multi-tenant.spec.js.map