export function computeGeometryBounds(features) {
  if (!Array.isArray(features) || features.length === 0) return null;

  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;
  let hasValidCoords = false;

  for (const feat of features) {
    const geometry = feat?.geometry;
    const type = geometry?.type;
    const coords = geometry?.coordinates;
    if (!coords) continue;

    const allPolygons = type === "Polygon" ? [coords] : type === "MultiPolygon" ? coords : [];

    for (const polygon of allPolygons) {
      for (const ring of polygon) {
        if (!Array.isArray(ring)) continue;
        for (const coord of ring) {
          if (!Array.isArray(coord)) continue;
          const lng = coord[0];
          const lat = coord[1];
          if (typeof lng === "number" && typeof lat === "number") {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            hasValidCoords = true;
          }
        }
      }
    }
  }

  if (!hasValidCoords || minLng >= 180) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
