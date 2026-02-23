import { isPolygonGeometry } from '../src/common/utils/geo';

describe('isPolygonGeometry', () => {
  it('accepts polygon geometry', () => {
    const geometry = {
      type: 'Polygon',
      map: 'ignore',
      coordinates: [
        [
          [-46.66, -23.56],
          [-46.64, -23.56],
          [-46.64, -23.54],
          [-46.66, -23.54],
          [-46.66, -23.56],
        ],
      ],
    };
    expect(isPolygonGeometry(geometry)).toBe(true);
  });

  it('rejects point geometry', () => {
    const geometry = {
      type: 'Point',
      coordinates: [-46.66, -23.56],
    };
    expect(isPolygonGeometry(geometry)).toBe(false);
  });
});
