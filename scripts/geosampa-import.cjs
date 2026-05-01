#!/usr/bin/env node
/**
 * GeoSampa WFS Import Pipeline
 * Downloads real "lote_cidadao" parcels from GeoSampa WFS API,
 * converts UTM 23S → WGS84, and imports into FlyDea.
 *
 * Usage: node scripts/geosampa-import.mjs
 *
 * Source: https://github.com/geoinfo-smdu/download-lotes-geosampa
 * Layer: geoportal:lote_cidadao (lot by fiscal sector)
 * CRS: EPSG:31983 → EPSG:4326
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

function utmToWgs84(easting, northing, zone, southern) {
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  const x = easting - 500000;
  let y = northing;
  if (southern) y -= 10000000;

  // WGS84 degrees per meter at approximate latitude
  const latDeg = y / 111319.9;
  const latRad = latDeg * Math.PI / 180;
  const metersPerDegLon = 111319.9 * Math.cos(latRad);
  const lonDeg = centralMeridian + x / metersPerDegLon;

  return [
    Math.round(lonDeg * 1000000) / 1000000,
    Math.round(latDeg * 1000000) / 1000000,
  ];
}

function convertCoords(coords, zone) {
  return coords.map(function (ring) {
    return ring.map(function (point) {
      return utmToWgs84(point[0], point[1], zone || 23, true);
    });
  });
}

function fetchWFS(setorFiscal) {
  return new Promise((resolve, reject) => {
    const url = `http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geoportal:lote_cidadao&cql_filter=cd_setor_fiscal='${String(setorFiscal).padStart(3, '0')}'&outputFormat=application/json&maxFeatures=500`;
    console.log(`  Fetching setor ${String(setorFiscal).padStart(3, '0')}...`);
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error for setor ${setorFiscal}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const startSetor = parseInt(args[0]) || 1;
  const endSetor = parseInt(args[1]) || 5;
  const API_URL = process.env.API_URL || 'http://localhost:4000';
  const TOKEN = process.env.TOKEN || '';
  const TENANT_ID = process.env.TENANT_ID || '69e10f36b2c066ab8f80b2c3';
  const PROJECT_ID = process.env.PROJECT_ID || '69e10f36b2c066ab8f80b303';

  console.log(`=== GeoSampa Import: Setores ${startSetor}-${endSetor} ===`);
  console.log(`API: ${API_URL}`);
  console.log(`Tenant: ${TENANT_ID}\n`);

  let totalFeatures = 0;
  let totalImported = 0;

  for (let s = startSetor; s <= endSetor; s++) {
    try {
      const geojson = await fetchWFS(s);
      if (!geojson.features || geojson.features.length === 0) {
        console.log(`  Setor ${String(s).padStart(3, '0')}: 0 features`);
        continue;
      }

      // Convert UTM → WGS84 and map fields
      const mapped = geojson.features.map((f, i) => {
        const props = f.properties || {};
        const setor = props.cd_setor_fiscal || String(s).padStart(3, '0');
        const id = props.cd_identificador || props.cd_identificador_original_lote || `GS-${s}-${i}`;
        
        // Convert geometry coordinates from UTM 23S to WGS84
        let coords;
        if (f.geometry && f.geometry.type === 'Polygon') {
          coords = convertCoords(f.geometry.coordinates, 23);
        } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
          coords = f.geometry.coordinates.map(poly => convertCoords(poly, 23));
        } else {
          coords = f.geometry ? f.geometry.coordinates : null;
        }

        return {
          type: 'Feature',
          geometry: coords ? { type: f.geometry.type, coordinates: coords } : f.geometry,
          properties: {
            sqlu: `SP-${setor}-${String(id).slice(-6)}`,
            inscription: `SP-GEOSAMPA-${id}`,
            inscricaoImobiliaria: `SP-IMO-${id}`,
            setor: setor,
            quadra: props.cd_quadra_fiscal || '',
            lote: props.cd_lote || '',
            sourceType: 'OFFICIAL_IMPORT',
            mainAddress: `Setor Fiscal ${setor}`,
            zoneamento: 'RESIDENCIAL',
            statusCadastral: 'ATIVO',
            workflowStatus: 'PENDENTE',
            isOfficial: true,
            rawProperties: props
          }
        };
      });

      totalFeatures += mapped.length;
      console.log(`  Setor ${String(s).padStart(3, '0')}: ${mapped.length} features (UTM→WGS84 converted)`);

      // Write individual setor file
      const fc = { type: 'FeatureCollection', features: mapped };
      fs.writeFileSync(`storage/geosampa-setor-${String(s).padStart(3, '0')}.geojson`, JSON.stringify(fc));

      // Import via API
      if (TOKEN) {
        const payload = JSON.stringify({
          data: fc,
          sourceType: 'OFFICIAL_IMPORT',
          fileName: `geosampa-setor-${String(s).padStart(3, '0')}.geojson`,
          municipalityName: 'Sao Paulo',
          municipalityCode: '3550308',
        });

        const result = await new Promise((resolve, reject) => {
          const url = new URL(`${API_URL}/ctm/parcels/import?projectId=${PROJECT_ID}`);
          const opts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOKEN}`,
              'X-Tenant-Id': TENANT_ID,
              'Content-Length': Buffer.byteLength(payload),
            }
          };
          const req = http.request(opts, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
              try { resolve(JSON.parse(body)); } catch { resolve(body); }
            });
          });
          req.on('error', reject);
          req.write(payload);
          req.end();
        });

        if (result.data) {
          totalImported += result.data.inserted || 0;
          console.log(`    Imported: ${result.data.inserted || 0}`);
        }
      }

    } catch (err) {
      console.log(`  Setor ${String(s).padStart(3, '0')}: ERROR - ${err.message}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Total features: ${totalFeatures}`);
  console.log(`Total imported: ${totalImported}`);
  console.log(`Files saved: storage/geosampa-setor-*.geojson`);
}

main().catch(console.error);
