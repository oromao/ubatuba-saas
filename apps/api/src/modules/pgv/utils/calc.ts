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

export function calculateVenalValue(input: VenalInput): VenalResult {
  const landValue = input.landArea * input.landValuePerSqm * input.landFactor;
  const constructionValue =
    input.builtArea * input.constructionValuePerSqm * input.constructionFactor;
  const totalValue = landValue + constructionValue;
  return { landValue, constructionValue, totalValue };
}
