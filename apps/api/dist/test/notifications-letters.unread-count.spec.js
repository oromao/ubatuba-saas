"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const notifications_letters_controller_1 = require("../src/modules/notifications-letters/notifications-letters.controller");
const notifications_letters_service_1 = require("../src/modules/notifications-letters/notifications-letters.service");
const notifications_letters_repository_1 = require("../src/modules/notifications-letters/notifications-letters.repository");
const projects_service_1 = require("../src/modules/projects/projects.service");
const parcels_repository_1 = require("../src/modules/ctm/parcels/parcels.repository");
const object_storage_service_1 = require("../src/modules/shared/object-storage.service");
describe('NotificationsLetters unread-count', () => {
    let app;
    const serviceMock = {
        getUnreadCount: jest.fn().mockResolvedValue({ count: 3 }),
    };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [notifications_letters_controller_1.NotificationsLettersController],
            providers: [
                { provide: notifications_letters_service_1.NotificationsLettersService, useValue: serviceMock },
                {
                    provide: notifications_letters_repository_1.NotificationsLettersRepository,
                    useValue: {},
                },
                {
                    provide: projects_service_1.ProjectsService,
                    useValue: {},
                },
                {
                    provide: parcels_repository_1.ParcelsRepository,
                    useValue: {},
                },
                {
                    provide: object_storage_service_1.ObjectStorageService,
                    useValue: {},
                },
            ],
        }).compile();
        app = moduleRef.createNestApplication();
        app.use((req, _res, next) => {
            req.tenantId = 'tenant-1';
            next();
        });
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('returns a real count instead of 404', async () => {
        await request(app.getHttpServer())
            .get('/notifications-letters/unread-count')
            .expect(200)
            .expect((res) => {
            expect(res.body.count).toBe(3);
        });
    });
});
//# sourceMappingURL=notifications-letters.unread-count.spec.js.map