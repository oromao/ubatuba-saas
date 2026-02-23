# FlyDea - SaaS de GeoInteligencia Municipal

Monorepo com frontend (Next.js) e backend (NestJS) para gestao territorial, monitoramento ambiental e aprovacao digital de processos.

## Como rodar (Docker)
1. Copie `.env.example` para `.env` e ajuste se necessario.
2. Suba a stack:
   ```bash
   docker compose up --build
   ```
3. Acesse:
   - Web: http://localhost:3000
   - API: http://localhost:4000
   - Health: http://localhost:4000/health
   - GeoServer: http://localhost:8080/geoserver
   - MinIO Console: http://localhost:9001

Credenciais DEV:
- GeoServer: `admin` / `geoserver`
- MinIO: `minioadmin` / `minioadmin`

### Acesso via rede local
- Web dev escuta em `0.0.0.0:3000` (script `npm run dev -w apps/web` já usa `next dev -H 0.0.0.0 -p 3000`).
- Em outro dispositivo da mesma rede acesse `http://<IP_da_maquina>:3000` (ex.: `http://192.168.1.22:3000`).
- Docker compose já expõe `3000:3000`; certifique-se de que firewall permite a porta.
- API: porta `4000` exposta; se acessar de outro device, garanta `NEXT_PUBLIC_API_URL=http://<IP_da_maquina>:4000` no `.env` (ou deixe vazio para usar autodetecção). CORS em dev está liberado (`*`).

## Perfis
- Dev:
  ```bash
  docker compose --profile dev up --build
  ```

## Credenciais demo
- Email: `admin@demo.local`
- Senha: `Admin@12345`
- Tenant slug: `demo`

## Migracoes e seed
- Rodadas automaticamente pelo servico `migrate`.
- Manual:
  ```bash
  docker-compose run --rm migrate
  ```

## GeoTIFF mockado (DEV)
- O arquivo mock fica em `infra/assets/mock-geotiff.tif`.
- A migration `003-seed-gis` faz:
  - upload do GeoTIFF para o MinIO
  - publicacao automatica no GeoServer (coverage store + layer)
  - criacao das camadas e areas no MongoDB
- O frontend consome WMS do GeoServer via MapLibre.

### Substituir pelo GeoTIFF real do drone
1. Substitua o arquivo por outro GeoTIFF e atualize `MOCK_GEOTIFF_PATH`, ou
2. Atualize o fluxo de upload para enviar o novo arquivo ao MinIO.
3. Re-rodar a migration que publica o GeoTIFF (ou criar uma nova migration).

## OSM Ubatuba (ruas e edificacoes)
Para popular vias e edificacoes reais da area urbana de Ubatuba/SP:
```bash
OSM_BBOX=-50.558,-20.294,-50.518,-20.248 \
OSM_TENANT_SLUG=demo \
OSM_PROJECT_SLUG=demo \
npm run import:osm -w apps/api
```

Opcional: salvar o JSON bruto do Overpass em arquivo:
```bash
OSM_OUTPUT_PATH=infra/assets/osm-ubatuba.json \
npm run import:osm -w apps/api
```

Se quiser importar a partir de um arquivo ja baixado:
```bash
OSM_INPUT_PATH=infra/assets/osm-ubatuba.json \
npm run import:osm -w apps/api
```

## Desenho no mapa (parcelas/edificacoes)
O mapa permite desenhar e editar geometrias salvas no MongoDB via `map-features`.

Endpoints:
- `POST /map-features`
- `PATCH /map-features/:id`
- `DELETE /map-features/:id`
- `GET /map-features/geojson?bbox=minLng,minLat,maxLng,maxLat&type=parcel|building`

Exemplo (cURL):
```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \\
  -d '{\"featureType\":\"parcel\",\"properties\":{\"name\":\"Lote A\",\"status\":\"ATIVO\"},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[-50.556,-20.292],[-50.552,-20.292],[-50.552,-20.288],[-50.556,-20.288],[-50.556,-20.292]]]}}' \\
  "http://localhost:4000/map-features"

curl -H "Authorization: Bearer <TOKEN>" \\
  "http://localhost:4000/map-features/geojson?bbox=-50.558,-20.294,-50.518,-20.248&type=parcel"
```

## Testes (API)
```bash
npm run test -w apps/api
```

## CTM + PGV (MVP)
Camadas novas no mapa:
- Parcelas CTM
- Ruas (OSM)
- Edificacoes (OSM)
- Zonas de valor
- Faces de quadra
- Mobiliario urbano

Principais endpoints (padrao atual):
- CTM Parcels: `GET /ctm/parcels`, `GET /ctm/parcels/geojson`, `POST /ctm/parcels`, `PATCH /ctm/parcels/:id`
- CTM Detalhe: `GET /ctm/parcels/:id/summary`
- CTM Logradouros: `GET /ctm/logradouros`, `POST /ctm/logradouros`
- CTM Mobiliario: `GET /ctm/urban-furniture`, `GET /ctm/urban-furniture/geojson`
- OSM Ruas: `GET /osm/roads/geojson`
- OSM Edificacoes: `GET /osm/buildings/geojson`
- PGV Zonas: `GET /pgv/zones`, `GET /pgv/zones/geojson`
- PGV Faces: `GET /pgv/faces`, `GET /pgv/faces/geojson`
- PGV Factor Set: `GET /pgv/factor-sets`, `PUT /pgv/factor-sets`
- PGV Versoes: `GET /pgv/versions`, `GET /pgv/versions/active`
- PGV Calculo: `POST /pgv/valuations/calculate`
- PGV Relatorio: `GET /pgv/valuations`
- PGV Export: `GET /pgv/valuations/export/csv`, `GET /pgv/valuations/export/geojson`

Endpoints alternativos (project-scoped):
- Parcelas: `GET /api/projects/:projectId/parcels`, `GET /api/projects/:projectId/parcels/geojson`
- Parcelas (CTM): `GET /api/projects/:projectId/parcels/:id/summary`
- PGV rapido: `POST /pgv/calculate`, `POST /pgv/recalculate-batch`
- PGV Export: `GET /pgv/report.csv`, `GET /pgv/parcels.geojson`

Importacao GeoJSON:
- Parcelas: `POST /ctm/parcels/import`
- Zonas: `POST /pgv/zones/import`
- Faces: `POST /pgv/faces/import`

Exemplos GeoJSON (minimo):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "sqlu": "001-001-001-001",
        "inscription": "INS-0001",
        "address": "Rua Central, 100",
        "status": "ATIVO"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-46.66, -23.56],
            [-46.64, -23.56],
            [-46.64, -23.54],
            [-46.66, -23.54],
            [-46.66, -23.56]
          ]
        ]
      }
    }
  ]
}
```

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "code": "ZV-01",
        "name": "Zona Centro",
        "baseLandValue": 420,
        "baseConstructionValue": 980
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-46.68, -23.58],
            [-46.6, -23.58],
            [-46.6, -23.52],
            [-46.68, -23.52],
            [-46.68, -23.58]
          ]
        ]
      }
    }
  ]
}
```

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "code": "F-001",
        "landValuePerSqm": 520
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-46.66, -23.56],
          [-46.64, -23.56]
        ]
      }
    }
  ]
}
```

Exportacao:
- CSV valores venais: `GET /pgv/valuations/export/csv`
- GeoJSON parcelas com valor_venal: `GET /pgv/valuations/export/geojson`

## Guia rapido de uso (CTM + PGV)
### 1) Acessar o painel
- Entre em http://localhost:3000 com `admin@demo.local` / `Admin@12345`, tenant `demo`.
- Va em **Mapas & Drones** para ver o mapa principal.
- Use a barra de desenho para criar parcelas/edificacoes personalizadas.

### 2) Parcelas (CTM)
- Ligue a camada **Parcelas CTM** na biblioteca de temas.
- Clique em um lote para abrir o painel lateral.
- Aba **CTM** mostra: cadastro predial, socioeconomico e infraestrutura.
- Para criar/editar, use as telas:
  - **CTM > Parcelas** (lista e busca)
  - **CTM > Logradouros**
  - **CTM > Mobiliario Urbano**

### 3) Zonas e faces (PGV)
- Ligue **Zonas de valor** e **Faces de quadra** no mapa.
- Use **PGV > Zonas** e **PGV > Faces** para criar/editar geometrias (GeoJSON).

### 4) Fatores e valores base
- Use **PGV > Fatores** para ajustar:
  - fatores de terreno (ex: localizacao, esquina)
  - fatores de construcao (uso/padrao)
  - valor base de construcao por m2

### 5) Calcular valor venal
- No painel de uma parcela, clique em **Calcular PGV**.
- O sistema salva a avaliacao (versao PGV) e mostra a memoria de calculo.

### 6) Filtros no mapa
- Filtre por **zona de valor**, **status cadastral** e **faixa de valor venal**.

### 7) Exportar relatorios
- CSV: `GET /pgv/valuations/export/csv`
- GeoJSON com valor venal: `GET /pgv/valuations/export/geojson`

### Exemplos (cURL)
```bash
# GeoJSON de parcelas por bbox (project-scoped)
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/projects/<PROJECT_ID>/parcels/geojson?bbox=minLng,minLat,maxLng,maxLat"

# Calcular PGV
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"parcelId":"<PARCEL_ID>","versionId":"<VERSION_ID>"}' \
  "http://localhost:4000/pgv/valuations/calculate"
```

## Redis (opcional)
- Para habilitar cache/rate limit, configure `REDIS_URL` e use o profile dev.
- Sem Redis, a aplicacao continua operando com fallback em memoria.

## Estrutura
- `apps/web`: Next.js + Tailwind + shadcn-like UI
- `apps/api`: NestJS + MongoDB + JWT + RBAC + Multi-tenant
- `infra/scripts`: utilitarios (wait-for)
- `infra/assets`: GeoTIFF mockado para DEV

## Guias Ubatuba
- Uso ponta a ponta: `docs/guia-ubatuba-ponta-a-ponta.md`
- Configuracao tenant REURB: `docs/tenant-ubatuba.md`
