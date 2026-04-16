
function calculateCentroid(geometry) {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
    return { type: 'Point', coordinates: [0, 0] };
  }

  let allCoords = [];
  if (geometry.type === 'Polygon') {
    allCoords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      if (polygon[0]) {
        allCoords.push(...polygon[0]);
      }
    }
  }

  if (allCoords.length > 0) {
    let sumX = 0, sumY = 0;
    for (const coord of allCoords) {
      sumX += coord[0];
      sumY += coord[1];
    }
    return { type: 'Point', coordinates: [sumX / allCoords.length, sumY / allCoords.length] };
  }
  
  return { type: 'Point', coordinates: [0, 0] };
}

function calculateBbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const polygons = geometry.type === 'Polygon' 
    ? [geometry.coordinates] 
    : geometry.coordinates;

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const coord of ring) {
        if (coord[0] < minX) minX = coord[0];
        if (coord[0] > maxX) maxX = coord[0];
        if (coord[1] < minY) minY = coord[1];
        if (coord[1] > maxY) maxY = coord[1];
      }
    }
  }

  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  
  return { minX, minY, maxX, maxY };
}

// Test cases
const poly = {
  type: 'Polygon',
  coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
};

const multipoly = {
  type: 'MultiPolygon',
  coordinates: [
    [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
    [[[10, 10], [12, 10], [12, 12], [10, 12], [10, 10]]]
  ]
};

console.log('Centroid Poly:', calculateCentroid(poly));
console.log('Bbox Poly:', calculateBbox(poly));
console.log('Centroid MultiPoly:', calculateCentroid(multipoly));
console.log('Bbox MultiPoly:', calculateBbox(multipoly));
