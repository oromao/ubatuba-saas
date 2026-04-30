// Manual mock for geojson-vt (ESM module incompatible with Jest)
// Implements the subset of geojson-vt API used by createVectorTile:
//   - createTileIndex(geojson, options) -> { getTile(z, x, y) -> tile | null }
//   - tile: { features: [...] } used by vt-pbf to encode MVT protobuf

function convertToTileCoords(coords, z, x, y, extent) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n - (2 * Math.PI) / Math.pow(2, z))) - Math.exp(-(n - (2 * Math.PI) / Math.pow(2, z))));
  const minLng = (x / Math.pow(2, z)) * 360 - 180;
  const maxLng = ((x + 1) / Math.pow(2, z)) * 360 - 180;
  const scaleX = extent / (maxLng - minLng);
  const scaleY = extent / (maxLat - minLat);

  return function project(point) {
    const px = Math.round((point[0] - minLng) * scaleX);
    const py = Math.round((maxLat - point[1]) * scaleY);
    return [px, py];
  };
}

function projectGeometry(geom, project, type) {
  if (type === 'Point') {
    return [[project(geom.coordinates)]];
  }
  if (type === 'Polygon') {
    return geom.coordinates.map(function (ring) {
      return ring.map(project);
    });
  }
  if (type === 'MultiPolygon') {
    return geom.coordinates.map(function (polygon) {
      return polygon.map(function (ring) {
        return ring.map(project);
      });
    });
  }
  return [];
}

function geoJSONToMapboxType(type) {
  if (type === 'Point' || type === 'MultiPoint') return 1;
  if (type === 'LineString' || type === 'MultiLineString') return 2;
  if (type === 'Polygon' || type === 'MultiPolygon') return 3;
  return 3;
}

function createTileIndex(geojson, options) {
  options = options || {};
  var maxZoom = options.maxZoom || 24;
  var extent = options.extent || 4096;
  var tolerance = options.tolerance || 3;
  var indexMaxZoom = options.indexMaxZoom || 5;

  // Pre-process features to detect bounding boxes
  var features = (geojson.features || []).map(function (f) {
    var geom = f.geometry;
    var type = geom.type;
    var coords = geom.coordinates;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    function expand(pos) {
      if (Array.isArray(pos) && typeof pos[0] === 'number') {
        minX = Math.min(minX, pos[0]);
        maxX = Math.max(maxX, pos[0]);
        minY = Math.min(minY, pos[1]);
        maxY = Math.max(maxY, pos[1]);
      } else if (Array.isArray(pos)) {
        pos.forEach(expand);
      }
    }
    expand(coords);

    return {
      id: f.id,
      type: type,
      geometry: geom,
      tags: f.properties || {},
      minX: minX, minY: minY, maxX: maxX, maxY: maxY
    };
  });

  return {
    getTile: function (z, x, y) {
      if (z < 0 || z > maxZoom) return null;

      var project = convertToTileCoords(null, z, x, y, extent);
      var tileFeatures = [];

      for (var i = 0; i < features.length; i++) {
        var f = features[i];
        var n = Math.pow(2, z);
        var tileMinX = (x / n) * 360 - 180;
        var tileMaxX = ((x + 1) / n) * 360 - 180;
        var tileMinY = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
        var tileMaxY = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));

        // Check intersection
        if (f.maxX < tileMinX || f.minX > tileMaxX || f.maxY < tileMinY || f.minY > tileMaxY) {
          continue;
        }

        var projected = projectGeometry(f.geometry, project, f.type);
        if (projected.length === 0) continue;

        tileFeatures.push({
          geometry: projected,
          type: geoJSONToMapboxType(f.type),
          tags: f.tags
        });
      }

      if (tileFeatures.length === 0) return null;

      return {
        features: tileFeatures,
        numPoints: tileFeatures.reduce(function (s, f) {
          var count = 0;
          function countPts(arr) {
            if (Array.isArray(arr) && Array.isArray(arr[0]) && typeof arr[0][0] === 'number') {
              count++;
            } else if (Array.isArray(arr)) {
              arr.forEach(countPts);
            }
          }
          countPts(f.geometry);
          return s + count;
        }, 0),
        numSimplified: 0,
        numFeatures: tileFeatures.length,
        source: null,
        x: x,
        y: y,
        z: z,
        transformed: false,
        minX: 0,
        minY: 0,
        maxX: extent,
        maxY: extent
      };
    }
  };
}

module.exports = createTileIndex;
module.exports.default = createTileIndex;
module.exports.__esModule = true;
