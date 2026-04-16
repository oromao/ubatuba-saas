/**
 * Demo seed: 200 parcelas, 50 surveys (levantamentos), 30 REURB projects, PGV values
 * All under tenantId: 'demo-tenant'
 * Usage: ts-node src/seed/demo-seed.ts
 */
import mongoose, { Types } from 'mongoose';

const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017/flydea';
const TENANT_ID = 'demo-tenant';

// ---- Helpers ----
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pad(n: number, len: number) {
  return String(n).padStart(len, '0');
}

// ---- Schemas (inline minimal, matches real schema fields) ----

const parcelSchema = new mongoose.Schema(
  {
    tenantId: { type: Types.ObjectId, required: true },
    projectId: { type: Types.ObjectId, required: true },
    sqlu: { type: String, required: true },
    inscricaoImobiliaria: String,
    inscription: String,
    mainAddress: String,
    enderecoPrincipal: Object,
    statusCadastral: String,
    status: String,
    observacoes: String,
    workflowStatus: { type: String, default: 'PENDENTE' },
    pendingIssues: [String],
    areaTerreno: Number,
    area: Number,
    geometry: { type: Object, required: true },
    createdBy: Types.ObjectId,
  },
  { timestamps: true, collection: 'parcels' },
);

const surveySchema = new mongoose.Schema(
  {
    tenantId: { type: Types.ObjectId, required: true },
    projectId: { type: Types.ObjectId, required: true },
    name: String,
    type: String,
    pipelineStatus: { type: String, default: 'RECEBIDO' },
    metadata: Object,
    files: [Object],
    qa: Object,
    auditLog: [Object],
  },
  { timestamps: true, collection: 'surveys' },
);

const reurbFamilySchema = new mongoose.Schema(
  {
    tenantId: { type: Types.ObjectId, required: true },
    projectId: { type: Types.ObjectId, required: true },
    familyCode: String,
    nucleus: String,
    responsibleName: String,
    cpf: String,
    address: String,
    membersCount: Number,
    monthlyIncome: Number,
    status: String,
    data: Object,
    documents: [Object],
  },
  { timestamps: true, collection: 'reurb_families' },
);

const pgvValuationSchema = new mongoose.Schema(
  {
    tenantId: { type: Types.ObjectId, required: true },
    projectId: { type: Types.ObjectId, required: true },
    parcelId: Types.ObjectId,
    sqlu: String,
    valorTerreno: Number,
    valorConstrucao: Number,
    valorTotal: Number,
    anoBase: Number,
  },
  { timestamps: true, collection: 'pgv_valuations' },
);

// ---- Data generators ----

const BAIRROS = ['Centro', 'Maracanã', 'Itaguá', 'Perequê-Açu', 'Tenório', 'Santa Cruz', 'Praia Grande', 'Sapê'];
const LOGRADOUROS = ['Rua das Palmeiras', 'Av. Iperoig', 'Rua Dona Maria', 'Rua Guarani', 'Estrada Municipal', 'Rua das Acácias', 'Tv. São João'];
const STATUSES_CADASTRAL = ['ATIVO', 'ATIVO', 'ATIVO', 'INATIVO', 'CONFLITO'];
const WORKFLOW_STATUSES = ['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'APROVADA', 'REPROVADA'];
const SURVEY_TYPES = ['AEROFOTO_RGB_5CM', 'MOBILE_LIDAR_360'];
const SURVEY_STATUSES = ['RECEBIDO', 'VALIDANDO', 'PUBLICADO', 'REPROVADO'];
const REURB_STATUSES = ['APTA', 'PENDENTE', 'IRREGULAR'];

// Fixed IDs matching real DB (tenant 'FlyDea Demo', project 'Projeto Demo')
const DEMO_PROJECT_ID = new Types.ObjectId('69cd5dc642c8e2d7bd230acf');
const TENANT_OID = new Types.ObjectId('69cd5dc642c8e2d7bd230a8f');

function makeBbox(lat: number, lng: number, delta = 0.001) {
  return {
    type: 'Polygon',
    coordinates: [[
      [lng, lat],
      [lng + delta, lat],
      [lng + delta, lat + delta],
      [lng, lat + delta],
      [lng, lat],
    ]],
  };
}

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB:', MONGO_URL);

  const ParcelModel = mongoose.model('DemoParcel', parcelSchema);
  const SurveyModel = mongoose.model('DemoSurvey', surveySchema);
  const ReurbFamilyModel = mongoose.model('DemoReurbFamily', reurbFamilySchema);
  const PgvValuationModel = mongoose.model('DemoPgvValuation', pgvValuationSchema);

  // Clear existing demo data
  await ParcelModel.deleteMany({ tenantId: TENANT_OID });
  await SurveyModel.deleteMany({ tenantId: TENANT_OID });
  await ReurbFamilyModel.deleteMany({ tenantId: TENANT_OID });
  await PgvValuationModel.deleteMany({ tenantId: TENANT_OID });
  console.log('Cleared existing demo data.');

  // ---- 200 Parcelas ----
  const parcels: any[] = [];
  for (let i = 1; i <= 200; i++) {
    const sector = randomInt(1, 4);
    const block = randomInt(1, 20);
    const sqlu = `SQ${pad(sector, 2)}${pad(block, 3)}${pad(i, 4)}`;
    const inscricao = `${sector}.0${pad(block, 2)}.${pad(i, 4)}.0001`;
    const bairro = randomFrom(BAIRROS);
    const logradouro = randomFrom(LOGRADOUROS);
    const numero = randomInt(1, 999);
    const area = randomInt(80, 800) + Math.random();
    const statusCadastral = randomFrom(STATUSES_CADASTRAL);
    const workflowStatus = randomFrom(WORKFLOW_STATUSES);
    const pendingIssues = workflowStatus === 'PENDENTE' ? ['SEM_GEOMETRIA'] : [];

    parcels.push({
      tenantId: TENANT_OID,
      projectId: DEMO_PROJECT_ID,
      sqlu,
      inscricaoImobiliaria: inscricao,
      inscription: inscricao,
      mainAddress: `${logradouro}, ${numero}`,
      enderecoPrincipal: {
        logradouro,
        numero: String(numero),
        bairro,
        cidade: 'Ubatuba',
        uf: 'SP',
        cep: `11680-${pad(randomInt(0, 999), 3)}`,
      },
      statusCadastral,
      status: statusCadastral,
      workflowStatus,
      pendingIssues,
      observacoes: i % 10 === 0 ? 'Imóvel em litígio' : undefined,
      areaTerreno: parseFloat(area.toFixed(2)),
      area: parseFloat(area.toFixed(2)),
      geometry: makeBbox(-23.4 + i * 0.0005, -45.08 + i * 0.0004),
      sourceType: 'DEMO',
      isOfficial: false,
    });
  }
  await ParcelModel.insertMany(parcels);
  console.log(`Inserted ${parcels.length} parcelas.`);

  // ---- 50 Levantamentos (Surveys) ----
  const surveys: any[] = [];
  for (let i = 1; i <= 50; i++) {
    surveys.push({
      tenantId: TENANT_OID,
      projectId: DEMO_PROJECT_ID,
      name: `Levantamento ${randomFrom(SURVEY_TYPES).replace('_', ' ')} #${pad(i, 3)}`,
      type: randomFrom(SURVEY_TYPES),
      pipelineStatus: randomFrom(SURVEY_STATUSES),
      metadata: {
        municipality: 'Ubatuba',
        surveyDate: `2024-${pad(randomInt(1, 12), 2)}-${pad(randomInt(1, 28), 2)}`,
        gsdCm: 5,
        srcDatum: 'SIRGAS2000',
        supplier: `Empresa Demo ${randomInt(1, 5)}`,
        precision: '5cm',
        bbox: [-45.1, -23.5, -44.9, -23.3],
      },
      files: [],
      qa: {
        coverageOk: i % 3 !== 0,
        georeferencingOk: i % 4 !== 0,
        qualityOk: i % 5 !== 0,
      },
      auditLog: [],
    });
  }
  await SurveyModel.insertMany(surveys);
  console.log(`Inserted ${surveys.length} levantamentos.`);

  // ---- 30 Famílias REURB ----
  const families: any[] = [];
  const nucleos = ['Núcleo A', 'Núcleo B', 'Vila Nova', 'Setor Norte', 'Zona Leste'];
  const nomes = ['João Silva', 'Maria Souza', 'Pedro Alves', 'Ana Costa', 'Carlos Ferreira', 'Lucia Rocha', 'Paulo Lima', 'Sandra Melo'];
  for (let i = 1; i <= 30; i++) {
    families.push({
      tenantId: TENANT_OID,
      projectId: DEMO_PROJECT_ID,
      familyCode: `FAM${pad(i, 4)}`,
      nucleus: randomFrom(nucleos),
      responsibleName: randomFrom(nomes),
      cpf: `${pad(randomInt(100, 999), 3)}.${pad(randomInt(100, 999), 3)}.${pad(randomInt(100, 999), 3)}-${pad(randomInt(10, 99), 2)}`,
      address: `${randomFrom(LOGRADOUROS)}, ${randomInt(1, 999)}, ${randomFrom(BAIRROS)}`,
      membersCount: randomInt(1, 7),
      monthlyIncome: randomInt(800, 4000),
      status: randomFrom(REURB_STATUSES),
      data: { reurbType: i % 2 === 0 ? 'REURB_S' : 'REURB_E' },
      documents: [],
    });
  }
  await ReurbFamilyModel.insertMany(families);
  console.log(`Inserted ${families.length} famílias REURB.`);

  // ---- PGV Values for each parcel ----
  const pgvValues: any[] = parcels.map((p) => ({
    tenantId: TENANT_OID,
    projectId: DEMO_PROJECT_ID,
    sqlu: p.sqlu,
    valorTerreno: parseFloat((p.area * randomInt(200, 800)).toFixed(2)),
    valorConstrucao: parseFloat((p.area * randomInt(100, 500)).toFixed(2)),
    valorTotal: 0,
    anoBase: 2024,
  }));
  pgvValues.forEach((v) => {
    v.valorTotal = parseFloat((v.valorTerreno + v.valorConstrucao).toFixed(2));
  });
  await PgvValuationModel.insertMany(pgvValues);
  console.log(`Inserted ${pgvValues.length} valores PGV.`);

  await mongoose.disconnect();
  console.log('Done. Demo seed complete.');
  console.log(`\nTenant ID used: ${TENANT_OID} (ObjectId for 'demo-tenant')`);
  console.log(`Project ID used: ${DEMO_PROJECT_ID}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
