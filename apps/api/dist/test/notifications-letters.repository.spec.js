"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notifications_letters_repository_1 = require("../src/modules/notifications-letters/notifications-letters.repository");
describe('NotificationsLettersRepository', () => {
    it('counts generated letters from the batch aggregate', async () => {
        const batchModelMock = {
            aggregate: jest.fn().mockResolvedValue([{ count: 7 }]),
        };
        const repository = new notifications_letters_repository_1.NotificationsLettersRepository({}, batchModelMock);
        const tenantId = new mongoose_1.Types.ObjectId().toHexString();
        const projectId = new mongoose_1.Types.ObjectId().toHexString();
        const count = await repository.countUnreadLetters(tenantId, projectId);
        expect(count).toBe(7);
        expect(batchModelMock.aggregate).toHaveBeenCalledTimes(1);
        expect(batchModelMock.aggregate.mock.calls[0][0]).toEqual(expect.arrayContaining([
            expect.objectContaining({
                $match: expect.objectContaining({
                    tenantId: expect.any(mongoose_1.Types.ObjectId),
                    projectId: expect.any(mongoose_1.Types.ObjectId),
                }),
            }),
            expect.objectContaining({
                $project: expect.any(Object),
            }),
            {
                $group: {
                    _id: null,
                    count: { $sum: '$pendingLetters' },
                },
            },
        ]));
    });
});
//# sourceMappingURL=notifications-letters.repository.spec.js.map