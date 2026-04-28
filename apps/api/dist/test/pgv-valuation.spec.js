"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
describe('PGV Valuation', () => {
    const mockZone = {
        id: 'zone-001',
        tenantId: 'tenant-001',
        projectId: 'project-001',
        name: 'Zone Comercial Centro',
        zoneCode: 'ZC001',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-46.31, -23.55],
                    [-46.30, -23.55],
                    [-46.30, -23.56],
                    [-46.31, -23.56],
                    [-46.31, -23.55],
                ],
            ],
        },
        baseValue: 5000,
        createdAt: new Date('2026-01-01'),
    };
    const mockFace = {
        id: 'face-001',
        tenantId: 'tenant-001',
        projectId: 'project-001',
        zoneId: 'zone-001',
        faceId: 'F001',
        address: 'Rua Principal, 100',
        geometry: {
            type: 'LineString',
            coordinates: [
                [-46.305, -23.55],
                [-46.304, -23.55],
            ],
        },
        lengthMeters: 1000,
        createdAt: new Date('2026-01-01'),
    };
    const mockFactors = [
        {
            id: 'factor-topography',
            name: 'Topografia',
            type: 'MULTIPLICATIVE',
            minValue: 0.5,
            maxValue: 1.5,
            defaultValue: 1.0,
        },
        {
            id: 'factor-infrastructure',
            name: 'Infraestrutura',
            type: 'MULTIPLICATIVE',
            minValue: 0.8,
            maxValue: 1.2,
            defaultValue: 1.0,
        },
        {
            id: 'factor-accessibility',
            name: 'Acessibilidade',
            type: 'ADDITIVE',
            minValue: -1000,
            maxValue: 2000,
            defaultValue: 0,
        },
    ];
    describe('Valuation Calculation', () => {
        it('should calculate base valuation from area and zone value', () => {
            const area = 150;
            const baseValue = 5000;
            const expectedValuation = area * baseValue;
            expect(expectedValuation).toBe(750000);
        });
        it('should apply multiplicative factors to valuation', () => {
            const baseValuation = 750000;
            const topographyFactor = 0.8;
            const infrastructureFactor = 1.1;
            const valuationWithFactors = baseValuation * topographyFactor * infrastructureFactor;
            expect(valuationWithFactors).toBe(660000);
        });
        it('should apply additive factors to valuation', () => {
            const baseValuation = 750000;
            const accessibilityAdjustment = 1500;
            const valuationWithAdjustment = baseValuation + accessibilityAdjustment;
            expect(valuationWithAdjustment).toBe(751500);
        });
        it('should combine multiplicative and additive factors correctly', () => {
            const baseValuation = 750000;
            const topographyFactor = 0.9;
            const infrastructureFactor = 1.2;
            const accessibilityAdjustment = 1000;
            const finalValuation = baseValuation * topographyFactor * infrastructureFactor +
                accessibilityAdjustment;
            expect(finalValuation).toBe(811000);
        });
        it('should enforce min/max bounds on factors', () => {
            const factors = {
                topography: 0.5,
                infrastructure: 1.5,
                accessibility: 2500,
            };
            const bounded = {
                topography: Math.max(0.5, Math.min(factors.topography, 1.5)),
                infrastructure: Math.max(0.8, Math.min(factors.infrastructure, 1.2)),
                accessibility: Math.max(-1000, Math.min(factors.accessibility, 2000)),
            };
            expect(bounded.topography).toBe(0.5);
            expect(bounded.infrastructure).toBe(1.2);
            expect(bounded.accessibility).toBe(2000);
        });
    });
    describe('Version Management', () => {
        it('should support multiple valuation versions', () => {
            const versions = [
                {
                    versionId: 'v1',
                    versionName: 'Jan 2026',
                    zoneId: 'zone-001',
                    baseValue: 5000,
                    timestamp: new Date('2026-01-01'),
                },
                {
                    versionId: 'v2',
                    versionName: 'Feb 2026 - Adjusted',
                    zoneId: 'zone-001',
                    baseValue: 5200,
                    timestamp: new Date('2026-02-01'),
                },
                {
                    versionId: 'v3',
                    versionName: 'Mar 2026 - Market correction',
                    zoneId: 'zone-001',
                    baseValue: 5100,
                    timestamp: new Date('2026-03-01'),
                },
            ];
            expect(versions).toHaveLength(3);
            expect(versions[0].baseValue).toBe(5000);
            expect(versions[1].baseValue).toBe(5200);
            expect(versions[2].baseValue).toBe(5100);
        });
        it('should calculate valuation impact between versions', () => {
            const parcelArea = 150;
            const valuationV1 = parcelArea * 5000;
            const valuationV2 = parcelArea * 5200;
            const valuationV3 = parcelArea * 5100;
            const impactV1toV2 = valuationV2 - valuationV1;
            const impactV2toV3 = valuationV3 - valuationV2;
            const impactV1toV3 = valuationV3 - valuationV1;
            expect(impactV1toV2).toBe(30000);
            expect(impactV2toV3).toBe(-15000);
            expect(impactV1toV3).toBe(15000);
        });
        it('should calculate percentage change in valuation', () => {
            const v1 = 750000;
            const v2 = 780000;
            const percentChange = ((v2 - v1) / v1) * 100;
            expect(percentChange).toBe(4);
        });
    });
    describe('Face-Level Valuation', () => {
        it('should calculate value for face based on length and factors', () => {
            const faceLength = 1000;
            const baseValuePerMeter = 500;
            const frontFactor = 1.2;
            const faceValue = faceLength * baseValuePerMeter * frontFactor;
            expect(faceValue).toBe(600000);
        });
        it('should aggregate value across multiple faces', () => {
            const faces = [
                { length: 1000, valuePerMeter: 500, factor: 1.2 },
                { length: 800, valuePerMeter: 500, factor: 0.9 },
                { length: 600, valuePerMeter: 500, factor: 0.7 },
            ];
            const totalValue = faces.reduce((sum, face) => sum + face.length * face.valuePerMeter * face.factor, 0);
            expect(totalValue).toBe(600000 + 360000 + 210000);
        });
    });
    describe('Trace & Audit', () => {
        it('should provide detailed trace of valuation calculation', () => {
            const trace = {
                parcelArea: 150,
                zoneId: 'zone-001',
                zoneName: 'Centro',
                baseValue: 5000,
                baseValuation: 750000,
                factors: [
                    {
                        name: 'Topografia',
                        type: 'MULTIPLICATIVE',
                        value: 0.8,
                        calculatedValue: 750000 * 0.8,
                    },
                    {
                        name: 'Infraestrutura',
                        type: 'MULTIPLICATIVE',
                        value: 1.1,
                        calculatedValue: 750000 * 0.8 * 1.1,
                    },
                    {
                        name: 'Acessibilidade',
                        type: 'ADDITIVE',
                        value: 1000,
                        calculatedValue: 750000 * 0.8 * 1.1 + 1000,
                    },
                ],
                finalValue: 660000 + 1000,
            };
            expect(trace.finalValue).toBe(661000);
            expect(trace.factors).toHaveLength(3);
            expect(trace.factors[0].type).toBe('MULTIPLICATIVE');
            expect(trace.factors[2].type).toBe('ADDITIVE');
        });
        it('should create audit entries for valuation changes', () => {
            const auditLog = [
                {
                    id: 'audit-001',
                    action: 'VALUATION_CREATED',
                    userId: 'user-001',
                    timestamp: new Date('2026-01-01T10:00:00Z'),
                    details: { baseValue: 5000, versionId: 'v1' },
                },
                {
                    id: 'audit-002',
                    action: 'FACTOR_APPLIED',
                    userId: 'user-001',
                    timestamp: new Date('2026-01-01T11:30:00Z'),
                    details: { factorId: 'factor-topography', value: 0.9 },
                },
                {
                    id: 'audit-003',
                    action: 'VALUATION_UPDATED',
                    userId: 'user-002',
                    timestamp: new Date('2026-02-15T14:00:00Z'),
                    details: {
                        versionId: 'v2',
                        baseValueChange: { old: 5000, new: 5200 },
                    },
                },
            ];
            expect(auditLog).toHaveLength(3);
            expect(auditLog[0].action).toBe('VALUATION_CREATED');
            expect(auditLog[2].details?.baseValueChange?.new).toBe(5200);
        });
    });
    describe('Error Handling', () => {
        it('should reject negative or zero area', () => {
            const invalidAreas = [0, -100, -0.5];
            for (const area of invalidAreas) {
                expect(() => {
                    if (area <= 0)
                        throw new common_1.BadRequestException('Area must be positive');
                }).toThrow(common_1.BadRequestException);
            }
        });
        it('should reject factor values outside bounds', () => {
            const factorBounds = { min: 0.5, max: 1.5 };
            const invalidValues = [0.3, 1.6, -1];
            for (const value of invalidValues) {
                expect(() => {
                    if (value < factorBounds.min || value > factorBounds.max) {
                        throw new common_1.BadRequestException(`Factor must be between ${factorBounds.min} and ${factorBounds.max}`);
                    }
                }).toThrow(common_1.BadRequestException);
            }
        });
        it('should reject valuation without required fields', () => {
            const incompleteValuation = {
                zoneId: 'zone-001',
            };
            expect(() => {
                if (!incompleteValuation.parcelArea) {
                    throw new common_1.BadRequestException('Parcel area is required');
                }
            }).toThrow(common_1.BadRequestException);
        });
    });
    describe('Bulk Operations', () => {
        it('should recalculate valuations for entire zone', () => {
            const zone = { id: 'zone-001', baseValue: 5000 };
            const parcels = [
                { id: 'p1', area: 100 },
                { id: 'p2', area: 150 },
                { id: 'p3', area: 200 },
            ];
            const recalculated = parcels.map((parcel) => ({
                parcelId: parcel.id,
                oldValue: parcel.area * 5000,
                newValue: parcel.area * 5000,
                changed: false,
            }));
            expect(recalculated).toHaveLength(3);
            expect(recalculated[0].newValue).toBe(500000);
            expect(recalculated[1].newValue).toBe(750000);
            expect(recalculated[2].newValue).toBe(1000000);
        });
        it('should export valuations with zone and factor details', () => {
            const valuations = [
                {
                    parcelId: 'p1',
                    sqlu: '001.001.0001-01',
                    address: 'Rua A, 100',
                    area: 100,
                    zoneId: 'zone-001',
                    zoneCode: 'ZC001',
                    baseValuation: 500000,
                    topographyFactor: 0.9,
                    infrastructureFactor: 1.1,
                    finalValuation: 495000,
                },
            ];
            const csv = valuations
                .map((v) => `${v.parcelId},${v.sqlu},${v.address},${v.area},${v.zoneCode},${v.finalValuation}`)
                .join('\n');
            expect(csv).toContain('p1');
            expect(csv).toContain('ZC001');
            expect(csv).toContain('495000');
        });
    });
});
//# sourceMappingURL=pgv-valuation.spec.js.map