import { Types } from 'mongoose';
import { NotificationsLettersRepository } from '../src/modules/notifications-letters/notifications-letters.repository';

describe('NotificationsLettersRepository', () => {
  it('counts generated letters from the batch aggregate', async () => {
    const batchModelMock = {
      aggregate: jest.fn().mockResolvedValue([{ count: 7 }]),
    };

    const repository = new NotificationsLettersRepository({} as any, batchModelMock as any);
    const tenantId = new Types.ObjectId().toHexString();
    const projectId = new Types.ObjectId().toHexString();

    const count = await repository.countUnreadLetters(tenantId, projectId);

    expect(count).toBe(7);
    expect(batchModelMock.aggregate).toHaveBeenCalledTimes(1);
    expect(batchModelMock.aggregate.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            tenantId: expect.any(Types.ObjectId),
            projectId: expect.any(Types.ObjectId),
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
      ]),
    );
  });
});
