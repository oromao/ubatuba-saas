"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const reurb_controller_1 = require("../src/modules/reurb/reurb.controller");
const reurb_service_1 = require("../src/modules/reurb/reurb.service");
const roles_guard_1 = require("../src/common/guards/roles.guard");
describe('ReurbController (api e2e)', () => {
    let app;
    const lgpdPurposeHeader = { 'x-lgpd-purpose': 'auditoria-reurb' };
    const reurbServiceMock = {
        getTenantConfig: jest.fn().mockResolvedValue({ reurbEnabled: true }),
        upsertTenantConfig: jest.fn().mockResolvedValue({ reurbEnabled: true }),
        createFamily: jest.fn().mockResolvedValue({ id: 'fam-1', familyCode: 'FAM-001' }),
        listFamilies: jest.fn().mockResolvedValue([{ id: 'fam-1', familyCode: 'FAM-001' }]),
        updateFamily: jest.fn().mockResolvedValue({ id: 'fam-1', status: 'APTA' }),
        exportFamiliesCsv: jest.fn().mockResolvedValue({ id: 'del-1', kind: 'BANCO_TABULADO_CSV' }),
        exportFamiliesXlsx: jest.fn().mockResolvedValue({ id: 'del-2', kind: 'BANCO_TABULADO_XLSX' }),
        generatePlanilhaSintese: jest
            .fn()
            .mockRejectedValueOnce(new common_1.UnprocessableEntityException({
            code: 'REURB_VALIDATION_FAILED',
            errors: [{ code: 'MISSING_REQUIRED_FIELD', message: 'Campo obrigatorio ausente' }],
        }))
            .mockResolvedValueOnce({ id: 'del-3', kind: 'PLANILHA_SINTESE' }),
        createPendency: jest.fn().mockResolvedValue({ id: 'pen-1' }),
        listPendencies: jest.fn().mockResolvedValue([]),
        updatePendencyStatus: jest.fn().mockResolvedValue({ id: 'pen-1', status: 'RESOLVIDA' }),
        getPendencyEvents: jest.fn().mockReturnValue({ on: jest.fn(), off: jest.fn() }),
        requestDocumentUpload: jest.fn().mockResolvedValue({ url: 'http://upload' }),
        completeDocumentUpload: jest.fn().mockResolvedValue({ id: 'fam-1' }),
        generateCartorioPackage: jest.fn().mockResolvedValue({ id: 'del-4', kind: 'PACOTE_CARTORIO_ZIP' }),
        listDeliverables: jest.fn().mockResolvedValue([]),
        getDeliverableDownload: jest.fn().mockResolvedValue({ url: 'http://download' }),
    };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [reurb_controller_1.ReurbController],
            providers: [
                {
                    provide: reurb_service_1.ReurbService,
                    useValue: reurbServiceMock,
                },
                {
                    provide: roles_guard_1.RolesGuard,
                    useValue: { canActivate: () => true },
                },
            ],
        })
            .overrideProvider(reurb_service_1.ReurbService)
            .useValue(reurbServiceMock)
            .compile();
        app = moduleRef.createNestApplication();
        app.use((req, _res, next) => {
            req.tenantId = 'tenant-1';
            req.user = { sub: 'user-1', role: 'ADMIN' };
            next();
        });
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('simulates family registration and planilha generation block/unblock flow', async () => {
        await request(app.getHttpServer())
            .post('/reurb/families')
            .send({ familyCode: 'FAM-001', nucleus: 'N1', responsibleName: 'Maria' })
            .expect(201);
        const blocked = await request(app.getHttpServer())
            .post('/reurb/planilha-sintese/generate')
            .set(lgpdPurposeHeader)
            .send({})
            .expect(422);
        expect(blocked.body.code).toBe('REURB_VALIDATION_FAILED');
        await request(app.getHttpServer())
            .post('/reurb/pendencies')
            .send({ nucleus: 'N1', documentType: 'RG', missingDocument: 'RG frente', responsible: 'Equipe A' })
            .expect(201);
        const generated = await request(app.getHttpServer())
            .post('/reurb/planilha-sintese/generate')
            .set(lgpdPurposeHeader)
            .send({})
            .expect(201);
        expect(generated.body.kind).toBe('PLANILHA_SINTESE');
    });
});
//# sourceMappingURL=reurb-api.e2e.spec.js.map