import { GeometryService } from '../src/modules/ctm/geometry.service';

describe('GeometryService', () => {
  const service = new GeometryService();

  it('validates a simple polygon and calculates area', () => {
    const result = service.validateGeometry({
      type: 'Polygon',
      coordinates: [
        [
          [-46.305, -23.55],
          [-46.304, -23.55],
          [-46.304, -23.551],
          [-46.305, -23.551],
          [-46.305, -23.55],
        ],
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.calculatedArea).toBeGreaterThan(0);
  });

  it('rejects missing geometry', () => {
    const result = service.validateGeometry(null);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Geometria ausente');
  });

  it('detects overlap from bounding boxes', () => {
    expect(
      service.checkSimpleOverlap(
        {
          type: 'Polygon',
          coordinates: [
            [
              [-46.305, -23.55],
              [-46.304, -23.55],
              [-46.304, -23.551],
              [-46.305, -23.551],
              [-46.305, -23.55],
            ],
          ],
        },
        {
          type: 'Polygon',
          coordinates: [
            [
              [-46.3045, -23.5505],
              [-46.3035, -23.5505],
              [-46.3035, -23.5515],
              [-46.3045, -23.5515],
              [-46.3045, -23.5505],
            ],
          ],
        },
      ),
    ).toBe(true);
  });
});
