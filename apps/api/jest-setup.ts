// Jest setup file for API tests
// Global test configuration

// geojson-vt is an ESM module incompatible with ts-jest.
// Provide a CJS-compatible mock for all test suites.
jest.mock('geojson-vt', () => {
  // Simple self-contained tiling implementation
  function createTileIndex(geojson: any, options: any = {}) {
    const extent = options.extent || 4096;
    const features = (geojson.features || []).map((f: any) => ({
      id: f.id,
      type: f.type,
      geometry: f.geometry,
      tags: f.properties || {},
    }));

    function tileToLatLng(z: number, x: number, y: number, extent: number, geom: any, geomType: string) {
      const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
      const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
      const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n - (2 * Math.PI) / Math.pow(2, z))) - Math.exp(-(n - (2 * Math.PI) / Math.pow(2, z))));
      const minLng = (x / Math.pow(2, z)) * 360 - 180;
      const maxLng = ((x + 1) / Math.pow(2, z)) * 360 - 180;

      function bboxIntersects(feature: any) {
        const coords = feature.geometry.coordinates;
        if (!coords) return false;
        let fminX = Infinity, fminY = Infinity, fmaxX = -Infinity, fmaxY = -Infinity;
        function expand(c: any) {
          if (typeof c[0] === 'number') {
            fminX = Math.min(fminX, c[0]); fmaxX = Math.max(fmaxX, c[0]);
            fminY = Math.min(fminY, c[1]); fmaxY = Math.max(fmaxY, c[1]);
          } else if (Array.isArray(c)) c.forEach(expand);
        }
        expand(coords);
        return !(fmaxX < minLng || fminX > maxLng || fmaxY < minLat || fminY > maxLat);
      }

      return bboxIntersects;
    }

    function projectToTile(feature: any, z: number, x: number, y: number, extent: number) {
      const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
      const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
      const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n - (2 * Math.PI) / Math.pow(2, z))) - Math.exp(-(n - (2 * Math.PI) / Math.pow(2, z))));
      const minLng = (x / Math.pow(2, z)) * 360 - 180;
      const maxLng = ((x + 1) / Math.pow(2, z)) * 360 - 180;
      const sx = extent / (maxLng - minLng);
      const sy = extent / (maxLat - minLat);

      function project(c: [number, number]): [number, number] {
        return [Math.round((c[0] - minLng) * sx), Math.round((maxLat - c[1]) * sy)];
      }

      function projectCoords(coords: any): any {
        if (typeof coords[0] === 'number') return project(coords);
        return coords.map(projectCoords);
      }

      return projectCoords(feature.geometry.coordinates);
    }

    function geoJSONTypeToMapboxType(type: string) {
      if (type === 'Polygon' || type === 'MultiPolygon') return 3;
      if (type === 'LineString' || type === 'MultiLineString') return 2;
      return 1;
    }

    return {
      getTile: function (z: number, x: number, y: number) {
        const tileFeatures = features
          .filter((f: any) => tileToLatLng(z, x, y, extent, f.geometry, f.type)(f))
          .map((f: any) => ({
            geometry: projectToTile(f, z, x, y, extent),
            type: geoJSONTypeToMapboxType(f.type),
            tags: f.tags,
          }));

        if (tileFeatures.length === 0) return null;

        return {
          features: tileFeatures,
          numPoints: 1,
          numSimplified: 0,
          numFeatures: tileFeatures.length,
          source: null,
          x, y, z,
          transformed: false,
          minX: 0, minY: 0, maxX: extent, maxY: extent,
        };
      },
    };
  }

  return { __esModule: true, default: createTileIndex };
});
