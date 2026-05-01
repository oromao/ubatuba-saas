# 08 — Real Data Demo Strategy

> Última atualização: 2026-04-30 por OpenCode
> Objetivo: Demo com dados geoespaciais reais para competir com GeoPixel

---

## 1. Fonte de Dados

### Fonte primária: GeoSampa (Prefeitura de São Paulo)
- URL: https://geosampa.prefeitura.sp.gov.br/
- Camadas disponíveis: Lote Fiscal, Quadra Fiscal, Logradouro, Setor Fiscal
- Formato: GeoJSON/SHP via API WFS ou download
- Status: **A API pública do GeoSampa requer autenticação. Alternativa: download direto de shapefiles.**

### Fonte alternativa (usada nesta demo): OpenStreetMap
- URL: https://overpass-api.de/
- Dados: Buildings (parcel-like polygons), roads (logradouros), landuse
- Formato: GeoJSON via Overpass API
- Licença: ODbL (Open Database License)
- Motivo: API GeoSampa bloqueada sem token. OSM fornece geometrias reais de SP.

---

## 2. Pipeline de Importação

### Fluxo:
1. **Download** → Bash script `scripts/download-real-data.sh`
2. **Transform** → Converte OSM buildings para formato Parcel (sqlu, geometry, address)
3. **Import** → Endpoint `POST /ctm/parcels/import` (GeoJSON FeatureCollection)
4. **Validate** → Playwright E2E test verifica renderização no mapa

### Script de download:
```bash
# scripts/download-real-data.sh
# Baixa buildings de SP via Overpass API
curl -X POST https://overpass-api.de/api/interpreter \
  -d 'data=[out:json];area[name="São Paulo"]->.sp;way(area.sp)["building"](if:t["addr:street"]);out geom 2000;' \
  -o storage/geosampa-buildings.geojson
```

### Script de transformação:
- `scripts/transform-osm-to-parcels.ts`
- Converte tags OSM (`addr:street`, `addr:housenumber`) para campos Parcel
- Gera sqlu a partir de coordenadas ou hash
- Atribui sourceType='OFFICIAL_IMPORT'

---

## 3. Dados Mínimos para Demo

| Entidade | Quantidade | Fonte |
|---|---|---|
| Parcelas | 2000+ | OSM buildings em SP |
| Logradouros | 50+ | OSM highways em SP |
| Vistorias | 5+ | Criadas via UI vinculadas a parcelas |
| Zonas PGV | 3 | Seed manual com alíquotas reais |
| Usuários | 4 | admin, gestor, operador, leitor |

---

## 4. Fluxos da Demo

1. **Login** → admin@demo.local / Admin@12345
2. **Dashboard** → KPIs com dados de parcelas reais
3. **Mapa** → Parcelas renderizadas no mapa interativo com zoom/cluster
4. **Parcela** → Clique em parcela no mapa → detalhes (sqlu, endereço, área)
5. **Vistoria** → Criar vistoria vinculada a parcela/lote real
6. **IPTU** → Cálculo de IPTU com valor venal × alíquota

---

## 5. Implementação

### script/download-real-data.sh
```bash
#!/bin/bash
# Download real building footprints for São Paulo from OSM
echo "Downloading SP buildings..."
curl -s -X POST https://overpass-api.de/api/interpreter \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'data=[out:json][timeout:60];area[name="São Paulo"]->.sp;(way(area.sp)["building"](if:t["addr:street"]);node(w););out geom 3000;' \
  -o /tmp/sp-buildings.json

echo "Converting to GeoJSON FeatureCollection..."
node -e "
const data = require('/tmp/sp-buildings.json');
const features = (data.elements||[]).filter(e=>e.type==='way'&&e.geometry).map((e,i)=>({
  type:'Feature',
  id: e.id,
  geometry: { type:'Polygon', coordinates: [e.geometry.map(p=>[p.lon,p.lat])] },
  properties: {
    sqlu: 'SP-'+String(e.id),
    mainAddress: (e.tags?.['addr:street']||'') + (e.tags?.['addr:housenumber']?', '+e.tags['addr:housenumber']:''),
    setor: e.tags?.['addr:suburb']||'',
    sourceType: 'OFFICIAL_IMPORT',
    areaTerreno: null,
    building: e.tags?.building||'yes',
    buildingLevels: e.tags?.['building:levels']||null
  }
}));
console.log(JSON.stringify({ type:'FeatureCollection', features }));
" > storage/geosampa-buildings.geojson

echo "Done. $(node -e "console.log(require('./storage/geosampa-buildings.geojson').features.length)") features exported."
```

---

## 6. Validação

- `npx playwright test tests/e2e/fullscan/menu-smoke.spec.ts` — navegação
- `npx playwright test --project=scan tests/e2e/fullscan/fullscan.admin.spec.ts` — fluxo admin completo
- Verificar renderização de parcelas no mapa
- Verificar criação de vistoria vinculada a parcela

---

## 7. NOT PROVEN

- GeoSampa integração direta (API requer token)
- Importação de quadras fiscais e setores
- Dados de IPTU reais por parcela
- Valores venais reais (planta de valores municipal)
