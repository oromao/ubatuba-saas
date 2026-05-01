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

// WGS84 UTM conversion constants
const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;
const K0 = 0.9996;

function utmToWgs84(easting, northing, zone, southern) {
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  let nAdj = northing;
  if (southern) nAdj -= 10000000.0;

  const x = easting - 500000.0;
  const y = nAdj;
  const M = y / K0;
  const mu = M / (WGS84_A * (1 - WGS84_F * (1 / 4 + WGS84_F * (3 / 64 + 5 * WGS84_F / 256))));

  const e1 = (1 - Math.sqrt(1 - 2 * WGS84_F + WGS84_F * WGS84_F)) / (1 + Math.sqrt(1 - 2 * WGS84_F + WGS84_F * WGS84_F));

  const J1 = (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32);
  const J2 = (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32);
  const J3 = (151 * e1 * e1 * e1 / 96);
  const J4 = (1097 * e1 * e1 * e1 * e1 / 512);

  const fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);

  const C1 = (2 * WGS84_F - WGS84_F * WGS84_F) * (Math.cos(fp) * Math.cos(fp));
  const T1 = Math.tan(fp) * Math.tan(fp);
  const R1 = WGS84_A * (1 - 2 * WGS84_F + WGS84_F * WGS84_F) / Math.pow(1 - (2 * WGS84_F - WGS84_F * WGS84_F) * Math.sin(fp) * Math.sin(fp), 1.5);
  const N1 = WGS84_A / Math.sqrt(1 - (2 * WGS84_F - WGS84_F * WGS84_F) * Math.sin(fp) * Math.sin(fp));
  const D = x / (N1 * K0);

  const Q1 = N1 * Math.tan(fp) / R1;
  const Q2 = (D * D) / 2;
  const Q3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * (2 * WGS84_F - WGS84_F * WGS84_F)) * (D * D * D * D) / 24;
  const Q4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 3 * C1 * C1 - 252 * (2 * WGS84_F - WGS84_F * WGS84_F)) * (D * D * D * D * D * D) / 720;

  const lat = fp - Q1 * (Q2 - Q3 + Q4);
  const Q5 = D;
  const Q6 = (1 + 2 * T1 + C1) * (D * D * D) / 6;
  const Q7 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * (2 * WGS84_F - WGS84_F * WGS84_F) + 24 * T1 * T1) * (D * D * D * D * D) / 120;
  const lon = centralMeridian + (Q5 - Q6 + Q7) / Math.cos(fp);

  return [
    Math.round(lon * 1000000) / 1000000,
    Math.round(lat * 180 / Math.PI * 1000000) / 1000000
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
  const PROJECT_ID = process.env.PROJECT_ID || '69cd5dc642c8e2d7bd230acf';

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
