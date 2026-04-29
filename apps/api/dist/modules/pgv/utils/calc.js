"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVenalValue = calculateVenalValue;
function calculateVenalValue(input) {
    const landValue = input.landArea * input.landValuePerSqm * input.landFactor;
    const constructionValue = input.builtArea * input.constructionValuePerSqm * input.constructionFactor;
    const totalValue = landValue + constructionValue;
    return { landValue, constructionValue, totalValue };
}
//# sourceMappingURL=calc.js.map