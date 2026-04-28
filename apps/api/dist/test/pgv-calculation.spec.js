"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calc_1 = require("../src/modules/pgv/utils/calc");
describe('calculateVenalValue', () => {
    it('calculates land and construction values', () => {
        const result = (0, calc_1.calculateVenalValue)({
            landArea: 200,
            builtArea: 150,
            landValuePerSqm: 400,
            landFactor: 1.1,
            constructionValuePerSqm: 900,
            constructionFactor: 0.9,
        });
        expect(result.landValue).toBeCloseTo(200 * 400 * 1.1);
        expect(result.constructionValue).toBeCloseTo(150 * 900 * 0.9);
        expect(result.totalValue).toBeCloseTo(result.landValue + result.constructionValue);
    });
});
//# sourceMappingURL=pgv-calculation.spec.js.map