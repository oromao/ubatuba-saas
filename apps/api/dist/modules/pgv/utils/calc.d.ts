export type VenalInput = {
    landArea: number;
    builtArea: number;
    landValuePerSqm: number;
    landFactor: number;
    constructionValuePerSqm: number;
    constructionFactor: number;
};
export type VenalResult = {
    landValue: number;
    constructionValue: number;
    totalValue: number;
};
export declare function calculateVenalValue(input: VenalInput): VenalResult;
