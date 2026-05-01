#!/bin/bash
# Download real building footprints from OpenStreetMap (Overpass API)
# Area: Central São Paulo region
# Usage: bash scripts/download-real-data.sh
set -e

OUTPUT="storage/sp-real-buildings.geojson"
TMPFILE="/tmp/sp-osm-raw.json"

echo "=== Downloading SP buildings from OpenStreetMap ==="
echo "Area: Centro de Sao Paulo (~ -46.65, -23.55)"
echo "Output: $OUTPUT"

# Bbox: central São Paulo area
BBOX="-46.70,-23.58,-46.60,-23.52"

curl -s -X POST https://overpass-api.de/api/interpreter \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "data=[out:json][timeout:60];(way[\"building\"]($BBOX);node(w););out geom 5000;" \
  -o "$TMPFILE"

TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TMPFILE','utf8')).elements?.length||0)")
echo "Downloaded $TOTAL OSM elements"

echo "=== Converting to GeoJSON FeatureCollection ==="
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$TMPFILE','utf8'));

const features = (data.elements || [])
  .filter(e => e.type === 'way' && e.geometry && e.geometry.length >= 4)
  .map((e, i) => {
    const coords = e.geometry.map(p => [p.lon, p.lat]);
    // Close polygon
    if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
      coords.push([...coords[0]]);
    }

    const street = e.tags?.['addr:street'] || '';
    const number = e.tags?.['addr:housenumber'] || '';
    const suburb = e.tags?.['addr:suburb'] || e.tags?.['addr:district'] || '';
    const postcode = e.tags?.['addr:postcode'] || '';

    // Generate parcel identifier from street + number or OSM ID
    const sqlu = street && number
      ? 'SP-' + street.replace(/[^a-zA-Z0-9]/g,'').slice(0,8).toUpperCase() + '-' + number
      : 'SP-OSM-' + e.id;

    const address = [street, number].filter(Boolean).join(', ');
    const fullAddress = [address, suburb, 'São Paulo', 'SP', postcode].filter(Boolean).join(' - ');

    return {
      type: 'Feature',
      id: e.id,
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {
        sqlu: sqlu,
        mainAddress: fullAddress,
        inscricaoImobiliaria: 'SP-IMOB-' + e.id,
        inscription: 'SP-INS-' + e.id,
        setor: suburb,
        quadra: e.tags?.['addr:block'] || '',
        lote: number,
        cep: postcode,
        sourceType: 'OFFICIAL_IMPORT',
        areaTerreno: null,
        zoneamento: e.tags?.landuse || 'RESIDENCIAL',
        building: e.tags?.building || 'yes',
        buildingLevels: parseInt(e.tags?.['building:levels']) || null,
        rawProperties: e.tags || {}
      }
    };
  });

const fc = { type: 'FeatureCollection', features };
fs.writeFileSync('$OUTPUT', JSON.stringify(fc, null, 2));
console.log('Exported ' + features.length + ' parcel features to $OUTPUT');
console.log('');
console.log('Import command:');
console.log('curl -X POST http://localhost:4000/ctm/parcels/import \\');
console.log('  -H \"Content-Type: application/json\" \\');
console.log('  -H \"Authorization: Bearer <token>\" \\');
console.log('  -H \"X-Tenant-Id: <tenant-id>\" \\');
console.log('  -d @$OUTPUT');
"

rm -f "$TMPFILE"
echo "=== Done ==="
