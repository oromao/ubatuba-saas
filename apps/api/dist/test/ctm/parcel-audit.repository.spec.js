"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parcel_audit_repository_1 = require("../../src/modules/ctm/parcels/parcel-audit.repository");
describe('ParcelAuditRepository', () => {
    const tenantId = '65a000000000000000000001';
    const projectId = '65a000000000000000000002';
    const parcelId = '65a000000000000000000003';
    const createQueryChain = () => {
        const chain = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
        };
        return chain;
    };
    it('filters listByParcel by tenant, project, and parcel', async () => {
        const chain = createQueryChain();
        const model = {
            find: jest.fn().mockReturnValue(chain),
        };
        const repository = new parcel_audit_repository_1.ParcelAuditRepository(model);
        await repository.listByParcel(tenantId, projectId, parcelId);
        expect(model.find).toHaveBeenCalledWith({
            tenantId: expect.any(Object),
            projectId: expect.any(Object),
            parcelId: expect.any(Object),
        });
        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
    it('filters listAll and countAll by tenant before applying optional filters', async () => {
        const listChain = createQueryChain();
        const countExec = jest.fn().mockResolvedValue(3);
        const countChain = { exec: countExec };
        const model = {
            find: jest.fn()
                .mockReturnValueOnce(listChain)
                .mockReturnValueOnce(countChain),
            countDocuments: jest.fn().mockReturnValue(countChain),
        };
        const repository = new parcel_audit_repository_1.ParcelAuditRepository(model);
        await repository.listAll(tenantId, {
            parcelId: parcelId,
            actorId: '65a000000000000000000004',
            action: 'UPDATE',
            limit: 10,
            offset: 5,
        });
        await repository.countAll(tenantId, {
            parcelId: parcelId,
            actorId: '65a000000000000000000004',
            action: 'UPDATE',
        });
        expect(model.find).toHaveBeenNthCalledWith(1, {
            tenantId: expect.any(Object),
            parcelId: expect.any(Object),
            actorId: expect.any(Object),
            action: 'UPDATE',
        });
        expect(model.countDocuments).toHaveBeenCalledWith({
            tenantId: expect.any(Object),
            parcelId: expect.any(Object),
            actorId: expect.any(Object),
            action: 'UPDATE',
        });
        expect(listChain.skip).toHaveBeenCalledWith(5);
        expect(listChain.limit).toHaveBeenCalledWith(10);
        expect(listChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
});
//# sourceMappingURL=parcel-audit.repository.spec.js.map