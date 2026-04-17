jest.mock('./src/common/utils/mvt.util', () => ({
  createVectorTile: jest.fn(() => Buffer.from('')),
}));
