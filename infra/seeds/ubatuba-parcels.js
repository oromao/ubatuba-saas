/**
 * Seed realista de parcelas CTM para Ubatuba-SP
 * Execução: mongosh mongodb://localhost:27017/flydea ubatuba-parcels.js
 *
 * Gera ~160 lotes em 8 quadras de bairros reais de Ubatuba
 * Lote padrão: ~10m largura × 25m profundidade
 * Coordenadas: WGS84 lon/lat
 */

const DB_NAME = "flydea";
const TENANT_SLUG = "ubatuba";

// Conversão métrica → graus (lat -23.4°)
// 1° lon ≈ 102.4km | 1° lat ≈ 111.0km
const LOT_W = 0.000098;  // ~10m largura
const LOT_D = 0.000225;  // ~25m profundidade
const STR_W = 0.000098;  // ~10m rua local
const STR_M = 0.000196;  // ~20m avenida

// ── helpers ─────────────────────────────────────────────────────────────────

function lotPolygon(lng0, lat0, w, d) {
  return {
    type: "Polygon",
    coordinates: [[
      [lng0,     lat0    ],
      [lng0 + w, lat0    ],
      [lng0 + w, lat0 + d],
      [lng0,     lat0 + d],
      [lng0,     lat0    ],
    ]],
  };
}

function polyArea(coords) {
  // Shoelace em graus → converte m²  (approx)
  const ring = coords[0];
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  const degArea = Math.abs(area) / 2;
  return Math.round(degArea * 111000 * 102400); // rough m²
}

/**
 * Gera uma quadra com lotes alinhados.
 * @param {object} cfg
 *   startLng, startLat – canto SW da quadra
 *   cols – número de lotes
 *   rows – fileiras (frente/fundo)
 *   lotW, lotD – dimensões do lote
 *   logradouro – nome da rua
 *   numBase – número base do endereço
 *   bairro
 *   bloco – código do bloco para SQLU
 *   startIdx – índice global inicial
 */
function buildBlock(cfg, tenantId, projectId, now) {
  const {
    startLng, startLat, cols, rows = 1,
    lotW = LOT_W, lotD = LOT_D,
    logradouro, numBase = 100, bairro,
    bloco, startIdx,
  } = cfg;

  const docs = [];
  let idx = startIdx;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lng0 = startLng + col * (lotW + 0.000002);
      const lat0 = startLat + row * (lotD + STR_W);
      const geometry = lotPolygon(lng0, lat0, lotW, lotD);
      const seqLote = String(col + 1 + row * cols).padStart(3, "0");
      const sqlu = `001-${String(bloco).padStart(3, "0")}-${seqLote}-001`;
      const numIns = String(idx + 1).padStart(5, "0");
      const inscricao = `35440${String(bloco).padStart(3, "0")}${seqLote}0001`;
      const numero = String(numBase + col * 2);
      const area = polyArea(geometry.coordinates);
      const statuses = ["ATIVO", "ATIVO", "ATIVO", "ATIVO", "CONFLITO"];
      const statusCadastral = statuses[idx % statuses.length];
      const uses = ["Residencial", "Residencial", "Residencial", "Comercial", "Misto"];
      const use = uses[idx % uses.length];
      const standards = ["Popular", "Medio", "Medio", "Alto"];
      const standard = standards[idx % standards.length];

      docs.push({
        tenantId,
        projectId,
        sqlu,
        inscricaoImobiliaria: inscricao,
        inscription: inscricao,
        enderecoPrincipal: {
          logradouro,
          numero,
          bairro,
          cidade: "Ubatuba",
          uf: "SP",
          cep: "11680-000",
        },
        mainAddress: `${logradouro}, ${numero} – ${bairro}`,
        statusCadastral,
        status: statusCadastral,
        workflowStatus: statusCadastral === "CONFLITO" ? "EM_VALIDACAO" : "APROVADA",
        observacoes: `Lote ${sqlu} – seed cadastral Ubatuba`,
        geometry,
        areaTerreno: area,
        area,
        // extras para relatórios
        _meta: { use, standard },
        createdAt: now,
        updatedAt: now,
      });
      idx++;
    }
  }
  return docs;
}

// ── blocos reais de Ubatuba ──────────────────────────────────────────────────
//
// Coordenadas verificadas no OpenStreetMap para Ubatuba-SP
// Cada bloco = uma face de quadra real
//
const BLOCKS = [
  // 1 – Rua Conceição (Centro histórico)
  {
    bloco: 1,
    startLng: -45.0742, startLat: -23.4338,
    cols: 10, rows: 2,
    logradouro: "Rua Conceição",
    numBase: 200, bairro: "Centro",
  },
  // 2 – Rua Dr. Esteves da Silva (Centro)
  {
    bloco: 2,
    startLng: -45.0742, startLat: -23.4355,
    cols: 10, rows: 2,
    logradouro: "Rua Dr. Esteves da Silva",
    numBase: 100, bairro: "Centro",
  },
  // 3 – Av. Iperoig (orla Centro)
  {
    bloco: 3,
    startLng: -45.0742, startLat: -23.4322,
    cols: 12, rows: 1,
    lotD: LOT_D * 1.5, // lotes de esquina maiores
    logradouro: "Avenida Iperoig",
    numBase: 50, bairro: "Centro",
  },
  // 4 – Rua Inácio Ribeiro Neto (Centro)
  {
    bloco: 4,
    startLng: -45.0705, startLat: -23.4338,
    cols: 8, rows: 2,
    logradouro: "Rua Inácio Ribeiro Neto",
    numBase: 300, bairro: "Centro",
  },
  // 5 – Rua João Batista Rodrigues Alves (Jardim Carolina)
  {
    bloco: 5,
    startLng: -45.0835, startLat: -23.4445,
    cols: 8, rows: 2,
    logradouro: "Rua João Batista Rodrigues Alves",
    numBase: 10, bairro: "Jardim Carolina",
  },
  // 6 – Rua das Pedras (Bel Vista)
  {
    bloco: 6,
    startLng: -45.0870, startLat: -23.4420,
    cols: 7, rows: 2,
    logradouro: "Rua das Pedras",
    numBase: 50, bairro: "Bel Vista",
  },
  // 7 – Av. Nassim Aidar (Sumaré)
  {
    bloco: 7,
    startLng: -45.0585, startLat: -23.4282,
    cols: 10, rows: 2,
    logradouro: "Avenida Nassim Aidar",
    numBase: 100, bairro: "Sumaré",
  },
  // 8 – Rua do Perequê-Açu (Sertão do Perequê)
  {
    bloco: 8,
    startLng: -45.0668, startLat: -23.4498,
    cols: 8, rows: 2,
    logradouro: "Rua do Perequê-Açu",
    numBase: 80, bairro: "Sertão do Perequê",
  },
];

// ── main ─────────────────────────────────────────────────────────────────────

const db = db.getSiblingDB(DB_NAME);
const now = new Date();

// 1. Localiza tenant ubatuba
const tenant = db.tenants.findOne({ slug: TENANT_SLUG });
if (!tenant) {
  print("❌  Tenant 'ubatuba' não encontrado. Execute seed-users.ts primeiro.");
  quit(1);
}
const tenantId = tenant._id;
print(`✅  Tenant: ${tenant.name} (${tenantId})`);

// 2. Localiza projeto default
let project = db.projects.findOne({ tenantId, isDefault: true });
if (!project) {
  project = db.projects.findOne({ tenantId });
}
if (!project) {
  print("❌  Nenhum projeto encontrado para o tenant.");
  quit(1);
}
const projectId = project._id;
print(`✅  Projeto: ${project.name} (${projectId})`);

// 3. Remove parcelas antigas (re-seed limpo)
const deleted = db.parcels.deleteMany({ tenantId, projectId });
print(`🗑   Removidas ${deleted.deletedCount} parcelas antigas`);

// 4. Gera e insere parcelas
let allDocs = [];
let globalIdx = 0;
for (const cfg of BLOCKS) {
  const docs = buildBlock({ ...cfg }, tenantId, projectId, now);
  allDocs = allDocs.concat(docs);
  globalIdx += docs.length;
}

const result = db.parcels.insertMany(allDocs);
print(`✅  ${Object.keys(result.insertedIds).length} parcelas inseridas em ${BLOCKS.length} quadras`);

// 5. Seed buildings para cada parcela
db.parcel_buildings.deleteMany({ tenantId, projectId });
const parcelDocs = db.parcels.find({ tenantId, projectId }).toArray();
const buildingDocs = parcelDocs.map((p, i) => ({
  tenantId,
  projectId,
  parcelId: p._id,
  useType: p._meta?.use ?? "Residencial",
  constructionStandard: p._meta?.standard ?? "Medio",
  builtArea: 80 + (i % 6) * 30,
  floors: (i % 3) + 1,
  constructionYear: 1980 + (i % 40),
  occupancyType: i % 7 === 0 ? "Desocupado" : "Ocupado",
  uso: p._meta?.use ?? "Residencial",
  padraoConstrutivo: p._meta?.standard ?? "Medio",
  areaConstruida: 80 + (i % 6) * 30,
  pavimentos: (i % 3) + 1,
  anoConstrucao: 1980 + (i % 40),
  tipoOcupacao: i % 7 === 0 ? "Desocupado" : "Ocupado",
  createdAt: now,
  updatedAt: now,
}));
db.parcel_buildings.insertMany(buildingDocs);
print(`✅  ${buildingDocs.length} edificações inseridas`);

// 6. Seed infraestrutura
db.parcel_infrastructure.deleteMany({ tenantId, projectId });
const infraDocs = parcelDocs.map((p, i) => ({
  tenantId,
  projectId,
  parcelId: p._id,
  water: true, agua: true,
  sewage: i % 4 !== 0, esgoto: i % 4 !== 0,
  electricity: true, energia: true,
  pavingType: i % 3 === 0 ? "Asfalto" : "Paralelepípedo",
  pavimentacao: i % 3 === 0 ? "Asfalto" : "Paralelepípedo",
  publicLighting: true, iluminacao: true,
  garbageCollection: true, coleta: true,
  createdAt: now,
  updatedAt: now,
}));
db.parcel_infrastructure.insertMany(infraDocs);
print(`✅  ${infraDocs.length} registros de infraestrutura inseridos`);

// 7. Seed socioeconômico
db.parcel_socioeconomics.deleteMany({ tenantId, projectId });
const socioRenda = ["BAIXA", "BAIXA_MEDIA", "MEDIA", "MEDIA_ALTA", "ALTA"];
const socioVuln  = ["ALTA", "MEDIA", "BAIXA", "BAIXA", "NENHUMA"];
const socioDocs = parcelDocs.map((p, i) => ({
  tenantId,
  projectId,
  parcelId: p._id,
  incomeBracket: socioRenda[i % socioRenda.length],
  faixaRenda:    socioRenda[i % socioRenda.length],
  residents: 2 + (i % 5),
  moradores: 2 + (i % 5),
  vulnerabilityIndicator: socioVuln[i % socioVuln.length],
  vulnerabilidade:        socioVuln[i % socioVuln.length],
  createdAt: now,
  updatedAt: now,
}));
db.parcel_socioeconomics.insertMany(socioDocs);
print(`✅  ${socioDocs.length} registros socioeconômicos inseridos`);

// 8. Configura camadas GIS para o tenant
db.layers.deleteMany({ tenantId });
const layerDefs = [
  {
    tenantId, name: "Mapa base OSM", group: "Base",
    type: "basemap", source: "external",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    opacity: 1, visible: true, order: 0,
    createdAt: now, updatedAt: now,
  },
  {
    tenantId, name: "Satélite (Esri)", group: "Base",
    type: "basemap", source: "external",
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    opacity: 1, visible: false, order: 1,
    createdAt: now, updatedAt: now,
  },
  {
    tenantId, name: "Parcelas CTM", group: "Cadastro",
    type: "mvt", source: "api",
    tileUrl: "/ctm/parcels/tiles/{z}/{x}/{y}.pbf",
    geometryType: "polygon",
    style: { fillColor: "#2dd4bf", lineColor: "#0f766e", lineWidth: 1, labelField: "sqlu" },
    opacity: 0.85, visible: true, order: 10,
    createdAt: now, updatedAt: now,
  },
  {
    tenantId, name: "Malha viária (OSM)", group: "Infraestrutura",
    type: "raster", source: "external",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    opacity: 0.5, visible: false, order: 5,
    createdAt: now, updatedAt: now,
  },
];
db.layers.insertMany(layerDefs);
print(`✅  ${layerDefs.length} camadas GIS configuradas`);

// 9. PGV – valores venais
db.pgvvaluations.deleteMany({ tenantId, projectId });
const pgvDocs = parcelDocs.map((p, i) => {
  const valorBase = 800 + (i % 8) * 150; // R$/m² faixa Ubatuba
  const area = p.areaTerreno ?? 250;
  return {
    tenantId, projectId,
    parcelId: p._id,
    sqlu: p.sqlu,
    valorTerreno: Math.round(area * valorBase),
    valorConstrucao: Math.round((p._meta?.standard === "Alto" ? 2500 : 1800) * (80 + (i % 6) * 30)),
    valorTotal: Math.round(area * valorBase + (p._meta?.standard === "Alto" ? 2500 : 1800) * (80 + (i % 6) * 30)),
    exercicio: 2025,
    createdAt: now,
    updatedAt: now,
  };
});
db.pgvvaluations.insertMany(pgvDocs);
print(`✅  ${pgvDocs.length} avaliações PGV inseridas`);

print("");
print("══════════════════════════════════════════════");
print(`🏙   Seed Ubatuba concluído!`);
print(`    Parcelas: ${allDocs.length}`);
print(`    Bairros: Centro, Jardim Carolina, Bel Vista, Sumaré, Sertão do Perequê`);
print(`    Camadas: ${layerDefs.length} configuradas`);
print("══════════════════════════════════════════════");
