"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017/flydea';
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function pad(n, len) {
    return String(n).padStart(len, '0');
}
const parcelSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
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
    createdBy: mongoose_1.Types.ObjectId,
}, { timestamps: true, collection: 'parcels' });
const surveySchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    name: String,
    type: String,
    pipelineStatus: { type: String, default: 'RECEBIDO' },
    metadata: Object,
    files: [Object],
    qa: Object,
    auditLog: [Object],
}, { timestamps: true, collection: 'surveys' });
const reurbFamilySchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
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
}, { timestamps: true, collection: 'reurb_families' });
const pgvValuationSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    parcelId: { type: mongoose_1.Types.ObjectId, required: true },
    versionId: { type: mongoose_1.Types.ObjectId, required: true },
    landValuePerSqm: { type: Number, required: true },
    landFactor: { type: Number, required: true },
    constructionValuePerSqm: { type: Number, required: true },
    constructionFactor: { type: Number, required: true },
    landValue: { type: Number, required: true },
    constructionValue: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    breakdown: { type: Object },
    createdBy: mongoose_1.Types.ObjectId,
}, { timestamps: true, collection: 'pgv_valuations' });
const pgvZoneSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    code: { type: String, required: true },
    name: String,
    description: String,
    baseLandValue: Number,
    baseConstructionValue: Number,
    aliquotaIptu: { type: Number, default: 0.005 },
    geometry: { type: Object, required: true },
}, { timestamps: true, collection: 'pgv_zones' });
const pgvFaceSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    code: { type: String, required: true },
    logradouro: String,
    zoneCode: String,
    landValuePerSqm: Number,
    geometry: { type: Object, required: true },
}, { timestamps: true, collection: 'pgv_faces' });
const vistoriaSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    parcelId: mongoose_1.Types.ObjectId,
    tipo: { type: String, enum: ['INICIAL', 'REINSPECAO', 'VISTORIA_ESPECIAL', 'CONFERENCIA'], required: true },
    data: { type: Date, required: true },
    observacoes: String,
    status: { type: String, enum: ['RASCUNHO', 'ENVIADA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA'], default: 'RASCUNHO' },
    fotos: [String],
    historico: [{ status: String, observacao: String, userId: String, timestamp: Date }],
    operadorId: String,
}, { timestamps: true, collection: 'vistorias' });
const BAIRROS = ['Centro', 'Maracanã', 'Itaguá', 'Perequê-Açu', 'Tenório', 'Santa Cruz', 'Praia Grande', 'Sapê'];
const LOGRADOUROS = ['Rua das Palmeiras', 'Av. Iperoig', 'Rua Dona Maria', 'Rua Guarani', 'Estrada Municipal', 'Rua das Acácias', 'Tv. São João'];
const STATUSES_CADASTRAL = ['ATIVO', 'ATIVO', 'ATIVO', 'INATIVO', 'CONFLITO'];
const WORKFLOW_STATUSES = ['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'APROVADA', 'REPROVADA'];
const SURVEY_TYPES = ['AEROFOTO_RGB_5CM', 'MOBILE_LIDAR_360'];
const SURVEY_STATUSES = ['RECEBIDO', 'VALIDANDO', 'PUBLICADO', 'REPROVADO'];
const REURB_STATUSES = ['APTA', 'PENDENTE', 'IRREGULAR'];
const DEMO_PROJECT_ID = new mongoose_1.Types.ObjectId('69cd5dc642c8e2d7bd230acf');
const TENANT_OID = new mongoose_1.Types.ObjectId('69cd5dc642c8e2d7bd230a8f');
function makeBbox(lat, lng, delta = 0.001) {
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
const letterTemplateSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    name: String,
    description: String,
    template: String,
    variables: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'letter_templates' });
const letterBatchSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.Types.ObjectId, required: true },
    projectId: { type: mongoose_1.Types.ObjectId, required: true },
    templateId: mongoose_1.Types.ObjectId,
    templateName: String,
    templateVersion: String,
    protocol: String,
    status: String,
    filter: Object,
    letters: [{ recipient: String, address: String, variables: Object }],
}, { timestamps: true, collection: 'letter_batches' });
async function seed() {
    await mongoose_1.default.connect(MONGO_URL);
    console.log('Connected to MongoDB:', MONGO_URL);
    const ParcelModel = mongoose_1.default.model('DemoParcel', parcelSchema);
    const SurveyModel = mongoose_1.default.model('DemoSurvey', surveySchema);
    const ReurbFamilyModel = mongoose_1.default.model('DemoReurbFamily', reurbFamilySchema);
    const PgvValuationModel = mongoose_1.default.model('DemoPgvValuation', pgvValuationSchema);
    const PgvZoneModel = mongoose_1.default.model('DemoPgvZone', pgvZoneSchema);
    const PgvFaceModel = mongoose_1.default.model('DemoPgvFace', pgvFaceSchema);
    const VistoriaModel = mongoose_1.default.model('DemoVistoria', vistoriaSchema);
    const LetterTemplateModel = mongoose_1.default.model('DemoLetterTemplate', letterTemplateSchema);
    const LetterBatchModel = mongoose_1.default.model('DemoLetterBatch', letterBatchSchema);
    const CemeteryPlotModel = mongoose_1.default.model('DemoCemeteryPlot', new mongoose_1.default.Schema({}, { strict: false, collection: 'cemetery_plots' }));
    const EnvironmentCaseModel = mongoose_1.default.model('DemoEnvironmentCase', new mongoose_1.default.Schema({}, { strict: false, collection: 'environment_cases' }));
    const PermitWorkRequestModel = mongoose_1.default.model('DemoPermitWork', new mongoose_1.default.Schema({}, { strict: false, collection: 'permit_work_requests' }));
    const PermitBusinessRequestModel = mongoose_1.default.model('DemoPermitBusiness', new mongoose_1.default.Schema({}, { strict: false, collection: 'permit_business_requests' }));
    const UrbanFurnitureModel = mongoose_1.default.model('DemoUrbanFurniture', new mongoose_1.default.Schema({}, { strict: false, collection: 'urban_furniture' }));
    const ComplianceProfileModel = mongoose_1.default.model('DemoComplianceProfile', new mongoose_1.default.Schema({}, { strict: false, collection: 'compliance_profiles' }));
    const PublicWorkModel = mongoose_1.default.model('DemoPublicWork', new mongoose_1.default.Schema({}, { strict: false, collection: 'public_works' }));
    const AssetModel = mongoose_1.default.model('DemoAsset', new mongoose_1.default.Schema({}, { strict: false, collection: 'assets' }));
    const EnvironmentalAlertModel = mongoose_1.default.model('DemoEnvironmentalAlert', new mongoose_1.default.Schema({}, { strict: false, collection: 'environmentalalerts' }));
    await ParcelModel.deleteMany({ tenantId: TENANT_OID });
    await SurveyModel.deleteMany({ tenantId: TENANT_OID });
    await ReurbFamilyModel.deleteMany({ tenantId: TENANT_OID });
    await PgvValuationModel.deleteMany({ tenantId: TENANT_OID });
    await PgvZoneModel.deleteMany({ tenantId: TENANT_OID });
    await PgvFaceModel.deleteMany({ tenantId: TENANT_OID });
    await VistoriaModel.deleteMany({ tenantId: TENANT_OID });
    await CemeteryPlotModel.deleteMany({ tenantId: TENANT_OID });
    await EnvironmentCaseModel.deleteMany({ tenantId: TENANT_OID });
    await PermitWorkRequestModel.deleteMany({ tenantId: TENANT_OID });
    await PermitBusinessRequestModel.deleteMany({ tenantId: TENANT_OID });
    await UrbanFurnitureModel.deleteMany({ tenantId: TENANT_OID });
    await ComplianceProfileModel.deleteMany({ tenantId: TENANT_OID });
    await PublicWorkModel.deleteMany({ tenantId: TENANT_OID });
    await AssetModel.deleteMany({ tenantId: TENANT_OID });
    await EnvironmentalAlertModel.deleteMany({ tenantId: TENANT_OID });
    await LetterTemplateModel.deleteMany({ tenantId: TENANT_OID });
    await LetterBatchModel.deleteMany({ tenantId: TENANT_OID });
    console.log('Cleared existing demo data.');
    const parcels = [];
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
    const insertedParcels = await ParcelModel.insertMany(parcels);
    console.log(`Inserted ${insertedParcels.length} parcelas.`);
    const surveys = [];
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
    const families = [];
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
    const pgvValues = insertedParcels.map((p) => ({
        tenantId: TENANT_OID,
        projectId: DEMO_PROJECT_ID,
        sqlu: p.sqlu,
        parcelId: p._id,
        valorTerreno: parseFloat((p.area * randomInt(200, 800)).toFixed(2)),
        valorConstrucao: parseFloat((p.area * randomInt(100, 500)).toFixed(2)),
        valorTotal: 0,
        anoBase: 2024,
    }));
    pgvValues.forEach((v) => {
        v.valorTotal = parseFloat((v.valorTerreno + v.valorConstrucao).toFixed(2));
    });
    await PgvValuationModel.insertMany(pgvValues);
    console.log(`Inserted ${pgvValues.length} valores PGV (official schema).`);
    const cemeteryPlots = [];
    const CEMETERIES = ['Cemitério Municipal Centro', 'Cemitério Jardim das Flores', 'Cemitério Distrital Maranduba'];
    const SECTIONS = ['A', 'B', 'C', 'D'];
    const OCCUPANTS = ['Antônio Santos', 'Maria de Oliveira', 'José Francisco', 'Francisca Souza', 'Sebastião Silva', 'Benedito Alves'];
    for (let i = 1; i <= 15; i++) {
        const status = i % 3 === 0 ? 'LIVRE' : i % 3 === 1 ? 'OCUPADO' : 'RESERVADO';
        cemeteryPlots.push({
            tenantId: TENANT_OID,
            cemeteryName: randomFrom(CEMETERIES),
            block: randomFrom(SECTIONS),
            row: String(randomInt(1, 10)),
            plot: pad(i, 3),
            status,
            ownerName: status !== 'LIVRE' ? randomFrom(nomes) : undefined,
            occupantName: status === 'OCUPADO' ? randomFrom(OCCUPANTS) : undefined,
            locationCode: `CEM-${pad(i, 3)}`,
            documentKeys: status !== 'LIVRE' ? [`licenca_sepultamento_${i}.pdf`] : [],
            history: [
                { status: 'LIVRE', observacao: 'Lote criado na base', timestamp: new Date('2024-01-01') },
                ...(status !== 'LIVRE' ? [{ status, observacao: `Lote atualizado para ${status}`, ownerName: randomFrom(nomes), timestamp: new Date() }] : [])
            ]
        });
    }
    await CemeteryPlotModel.insertMany(cemeteryPlots);
    console.log(`Inserted ${cemeteryPlots.length} lotes de cemitério.`);
    const envCases = [];
    const ENV_CATEGORIES = ['APP', 'PODA', 'ARVORE', 'LAUDO', 'OS', 'LICENCA'];
    const ENV_STATUSES = ['ABERTO', 'EM_ANALISE', 'DEFERIDO', 'INDEFERIDO'];
    const ENV_TITLES = [
        'Autorização para Poda de Árvore Risco',
        'Licenciamento Ambiental Simplificado Construção',
        'Laudo de Cobertura Vegetal - Lote 14',
        'Ordem de Serviço - Manejo de Arborização Urbana',
        'Fiscalização de Intervenção em APP Rio Grande',
        'Processo Ambiental de Supressão de Indivíduos Arbóreos'
    ];
    for (let i = 1; i <= 10; i++) {
        const category = randomFrom(ENV_CATEGORIES);
        const status = randomFrom(ENV_STATUSES);
        envCases.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            protocolNumber: `ENV-2024-${pad(i, 4)}`,
            title: `${randomFrom(ENV_TITLES)} #${i}`,
            category,
            status,
            evidenceKeys: [`foto_vistoria_ambiental_${i}.jpg`],
            tasks: [
                { title: 'Vistoria técnica in-loco', done: i % 2 === 0, assignedTo: 'Agente Ambiental' },
                { title: 'Análise de impacto ambiental', done: status === 'DEFERIDO' || status === 'INDEFERIDO', assignedTo: 'Analista' }
            ],
            history: [
                { status: 'ABERTO', action: 'Processo protocolado', timestamp: new Date('2024-02-15') },
                ...(status !== 'ABERTO' ? [{ status, action: `Status alterado para ${status}`, timestamp: new Date() }] : [])
            ]
        });
    }
    await EnvironmentCaseModel.insertMany(envCases);
    console.log(`Inserted ${envCases.length} processos ambientais.`);
    const permitWorks = [];
    const PERMIT_WORK_STATUSES = ['ABERTO', 'EM_ANALISE', 'DEFERIDO', 'INDEFERIDO', 'EXPEDIDO'];
    const APPLICANTS = ['Incorporadora Ubatuba', 'Mário Augusto', 'Clara Nunes S/A', 'Construtora Litoral', 'Roberto Carlos'];
    for (let i = 1; i <= 12; i++) {
        const parcel = randomFrom(insertedParcels);
        const status = randomFrom(PERMIT_WORK_STATUSES);
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        permitWorks.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            protocolNumber: `ALV-OBR-2024-${pad(i, 4)}`,
            applicantName: randomFrom(APPLICANTS),
            subjectAddress: parcel.mainAddress,
            status,
            currentStage: status === 'ABERTO' ? 'ABERTURA' : status === 'EM_ANALISE' ? 'ANALISE_TECNICA' : 'DESPACHO_FINAL',
            responsibleDepartment: 'Secretaria de Obras e Planejamento Urbano',
            parcelId: parcel._id,
            validUntil: status === 'EXPEDIDO' ? validUntil : undefined,
            requirements: [
                { name: 'Matrícula do Imóvel', status: 'ENTREGUE' },
                { name: 'Projeto Arquitetônico', status: 'ENTREGUE' },
                { name: 'ART/RRT de Projeto e Execução', status: i % 3 === 0 ? 'PENDENTE' : 'ENTREGUE' }
            ],
            decision: status === 'EXPEDIDO' || status === 'DEFERIDO' ? {
                authorizedArea: randomInt(100, 500),
                useType: 'RESIDENCIAL',
                responsibleEngineer: 'Eng. ' + randomFrom(nomes),
                crea: `${randomInt(100000, 999999)}/SP`
            } : undefined,
            history: [
                { stage: 'ABERTURA', status: 'ABERTO', description: 'Requerimento protocolado', timestamp: new Date('2024-03-01') },
                ...(status !== 'ABERTO' ? [{ stage: 'DESPACHO_FINAL', status, description: `Despacho final: ${status}`, timestamp: new Date() }] : [])
            ]
        });
    }
    await PermitWorkRequestModel.insertMany(permitWorks);
    console.log(`Inserted ${permitWorks.length} alvarás de obras.`);
    const permitBusinesses = [];
    const COMP_NAMES = ['Padaria Central Ubatuba', 'Farmácia Caiçara', 'Mercado Beira-Mar', 'Pousada Sol & Mar', 'Oficina Mecânica Centro'];
    const ACTIVITIES = ['Comércio varejista de alimentos', 'Serviços farmacêuticos', 'Supermercado e hortifrúti', 'Serviço de hospedagem e turismo', 'Manutenção e reparação de veículos'];
    for (let i = 1; i <= 10; i++) {
        const status = i % 4 === 0 ? 'PENDENTE' : 'ATIVO';
        permitBusinesses.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            protocolNumber: `ALV-EMP-2024-${pad(i, 4)}`,
            companyName: `${randomFrom(COMP_NAMES)} #${i}`,
            cnpj: `${pad(randomInt(10, 99), 2)}.${pad(randomInt(100, 999), 3)}.${pad(randomInt(100, 999), 3)}/0001-${pad(randomInt(10, 99), 2)}`,
            activityDescription: randomFrom(ACTIVITIES),
            status,
            currentStage: status === 'ATIVO' ? 'CONCLUIDO' : 'ANALISE_VIABILIDADE',
            responsibleDepartment: 'Secretaria de Finanças - Divisão de Posturas',
            taxes: [
                { name: 'Taxa de Licença e Funcionamento (TLF)', amount: randomInt(150, 600), status: status === 'ATIVO' ? 'PAGO' : 'EM_ABERTO' }
            ],
            history: [
                { stage: 'VIABILIDADE', status: 'ABERTO', description: 'Consulta de viabilidade aprovada', timestamp: new Date('2024-01-10') }
            ]
        });
    }
    await PermitBusinessRequestModel.insertMany(permitBusinesses);
    console.log(`Inserted ${permitBusinesses.length} alvarás de empresas.`);
    const pgvZones = [];
    const ZONE_NAMES = ['Zona Comercial 1 (ZC-1)', 'Zona Residencial Corredor (ZR-C)', 'Zona de Proteção Ambiental (ZPA-1)', 'Zona Industrial Mista (ZI-M)', 'Zona Especial Turística (ZET)'];
    const LAND_VALS = [850, 650, 200, 450, 1200];
    const CONST_VALS = [450, 350, 150, 300, 600];
    for (let i = 0; i < 5; i++) {
        const lat = -23.447;
        const lng = -45.078 + i * 0.005;
        pgvZones.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            code: `ZN-0${i + 1}`,
            name: ZONE_NAMES[i],
            nome: ZONE_NAMES[i],
            description: `Zona fiscal de tributação correspondente à área de ${ZONE_NAMES[i]}`,
            descricao: `Zona fiscal de tributação correspondente à área de ${ZONE_NAMES[i]}`,
            baseLandValue: LAND_VALS[i],
            valorBaseTerrenoM2: LAND_VALS[i],
            baseConstructionValue: CONST_VALS[i],
            valorBaseConstrucaoM2: CONST_VALS[i],
            aliquotaIptu: i === 2 ? 0.003 : i === 4 ? 0.008 : 0.005,
            geometry: makeBbox(lat, lng, 0.003)
        });
    }
    const insertedZones = await PgvZoneModel.insertMany(pgvZones);
    console.log(`Inserted ${insertedZones.length} zonas fiscais PGV.`);
    const pgvFaces = [];
    for (let i = 1; i <= 10; i++) {
        const zone = randomFrom(insertedZones);
        const lat = -23.445 + i * 0.001;
        const lng = -45.075;
        pgvFaces.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            code: `F-${pad(i, 3)}`,
            zoneId: zone._id,
            zonaValorId: zone._id,
            landValuePerSqm: zone.baseLandValue * 1.1,
            valorTerrenoM2: zone.baseLandValue * 1.1,
            geometry: {
                type: 'LineString',
                coordinates: [
                    [lng, lat],
                    [lng + 0.001, lat + 0.0005]
                ]
            }
        });
    }
    await PgvFaceModel.insertMany(pgvFaces);
    console.log(`Inserted ${pgvFaces.length} faces de quadra.`);
    const furniture = [];
    const FURNITURE_TYPES = ['ABRIGO_ONIBUS', 'LIXEIRA', 'POSTE_ILUMINACAO', 'MONUMENTO', 'PLACA_SINALIZACAO'];
    const FURNITURE_TIPOS = ['Abrigo de Ônibus', 'Lixeira Pública', 'Poste de Iluminação', 'Monumento Histórico', 'Placa de Sinalização'];
    const CONDITIONS = ['EXCELENTE', 'BOM', 'REGULAR', 'RUIM'];
    for (let i = 1; i <= 15; i++) {
        const indexType = randomInt(0, FURNITURE_TYPES.length - 1);
        const lat = -23.44 + i * 0.0008;
        const lng = -45.07 + i * 0.0006;
        furniture.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            type: FURNITURE_TYPES[indexType],
            tipo: FURNITURE_TIPOS[indexType],
            location: { type: 'Point', coordinates: [lng, lat] },
            geometry: { type: 'Point', coordinates: [lng, lat] },
            condition: randomFrom(CONDITIONS),
            estadoConservacao: randomFrom(CONDITIONS),
            notes: `Mobiliário urbano #${i} vistoriado pelo agente municipal`,
            observacao: `Mobiliário urbano #${i} vistoriado pelo agente municipal`
        });
    }
    await UrbanFurnitureModel.insertMany(furniture);
    console.log(`Inserted ${furniture.length} itens de mobiliário urbano.`);
    const compliances = [];
    const ENGS = ['Eng. José da Silva', 'Arq. Beatriz Albuquerque', 'Eng. Mateus Andrade', 'Eng. Patrícia Lima', 'Arq. Roberto Costa'];
    for (let i = 1; i <= 5; i++) {
        compliances.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            company: {
                cnpj: `22.345.678/0001-0${i}`,
                name: `Construtora e Incorporadora Ubatuba Nordeste #${i}`
            },
            technicalResponsibles: [
                { name: ENGS[i - 1], code: `CREA-${randomInt(10000, 99999)}`, role: 'Engenheiro Responsável' }
            ],
            artsRrts: [
                { number: `ART-2024-${pad(i, 5)}`, status: 'ATIVO', description: 'RRT de projeto arquitetônico' }
            ],
            cats: [
                { number: `CAT-2024-${pad(i, 4)}`, status: 'VALIDO', description: 'Acervo técnico em edificações residenciais' }
            ],
            team: [
                { name: 'Alvaro Neves', role: 'Mestre de Obras' },
                { name: 'Lucas Pinheiro', role: 'Fiscal de Segurança' }
            ],
            checklist: [
                { item: 'Sinalização de Obra e Canteiro', status: 'CONFORME' },
                { item: 'Uso de EPIs Obrigatórios', status: 'CONFORME' },
                { item: 'Controle de Resíduos e Entulho', status: i % 2 === 0 ? 'AVISO' : 'CONFORME' }
            ],
            auditLog: [
                { action: 'Perfil de compliance homologado', user: 'admin', timestamp: new Date() }
            ]
        });
    }
    await ComplianceProfileModel.insertMany(compliances);
    console.log(`Inserted ${compliances.length} perfis de compliance.`);
    const pubWorks = [];
    const DEPARTS = ['Secretaria de Obras', 'Secretaria de Saúde', 'Secretaria de Educação', 'Secretaria de Meio Ambiente'];
    const WORK_TITLES = [
        'Reforma e Ampliação da UBS Perequê-Açu',
        'Pavimentação Asfáltica e Drenagem da Av. Principal',
        'Construção da Nova Creche Municipal Centro',
        'Revitalização e Urbanização da Orla do Itaguá',
        'Canalização do Córrego Santa Cruz',
        'Reconstrução de Pontes Rurais pós-chuvas',
        'Implementação de Ciclovia da Praia Grande',
        'Reforma do Coreto Municipal e Praça da Matriz'
    ];
    for (let i = 0; i < 8; i++) {
        const status = i % 3 === 0 ? 'CONCLUIDA' : i % 3 === 1 ? 'EM_ANDAMENTO' : 'PLANEJADA';
        const progress = status === 'CONCLUIDA' ? 100 : status === 'EM_ANDAMENTO' ? randomInt(10, 95) : 0;
        pubWorks.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            protocolNumber: `OBR-PUB-2024-${pad(i + 1, 4)}`,
            title: WORK_TITLES[i],
            department: randomFrom(DEPARTS),
            location: 'Município de Ubatuba - SP',
            contractor: `Empreiteira Litoral Norte Ltda #${i + 1}`,
            status,
            stage: status === 'CONCLUIDA' ? 'CONCLUIDA' : status === 'EM_ANDAMENTO' ? 'EXECUCAO' : 'CADASTRO',
            progress,
            budget: randomInt(200000, 1500000),
            startDate: '2024-01-15',
            endDate: '2024-12-15'
        });
    }
    await PublicWorkModel.insertMany(pubWorks);
    console.log(`Inserted ${pubWorks.length} obras públicas.`);
    const assets = [];
    const ASSET_NAMES = [
        'Paço Municipal - Prefeitura de Ubatuba',
        'Câmara Municipal de Vereadores',
        'Posto de Saúde da Família Maranduba',
        'Escola Municipal Governador Mário Covas',
        'Parque Ecológico da Caçandoca',
        'Trator Municipal Pá Carregadora',
        'Ambulância do SAMU Ubatuba #03',
        'Teatro Municipal de Ubatuba',
        'Terminal Rodoviário Turístico Centro',
        'Quadra Poliesportiva Praia Grande',
        'Biblioteca Municipal Central',
        'Secretaria de Turismo e Eventos'
    ];
    for (let i = 0; i < 12; i++) {
        const lat = -23.45 + i * 0.001;
        const lng = -45.06 + i * 0.001;
        assets.push({
            tenantId: TENANT_OID,
            name: ASSET_NAMES[i],
            category: i < 5 ? 'EDIFICIO' : i < 8 ? 'VEICULO' : i < 10 ? 'PRACA_PARQUE' : 'EDIFICIO',
            status: i % 4 === 0 ? 'EM_MANUTENCAO' : 'ATIVO',
            location: { type: 'Point', coordinates: [lng, lat] }
        });
    }
    await AssetModel.insertMany(assets);
    console.log(`Inserted ${assets.length} ativos municipais.`);
    const envAlerts = [];
    const ALERT_TITLES = [
        'Foco de Desmatamento em Área de Preservação Permanente (APP)',
        'Risco Alto de Deslizamento de Encosta - Bairro Estufa II',
        'Lançamento Irregular de Efluentes no Rio Grande',
        'Acúmulo de Resíduos Sólidos em Terreno sob Embargo',
        'Invasão de Faixa de Areia e Construção Irregular',
        'Queimada Urbana sem Autorização - Maranduba',
        'Supressão de Vegetação Nativa da Mata Atlântica',
        'Risco de Inundação por Obstrução de Galeria Pluvial'
    ];
    const LEVELS = ['CRITICO', 'ALTO', 'MEDIO'];
    for (let i = 0; i < 8; i++) {
        const lat = -23.46 + i * 0.001;
        const lng = -45.05 + i * 0.001;
        const status = i % 2 === 0 ? 'RESOLVIDO' : 'ATIVO';
        envAlerts.push({
            tenantId: TENANT_OID,
            title: ALERT_TITLES[i],
            level: randomFrom(LEVELS),
            status,
            stage: status === 'RESOLVIDO' ? 'RESOLVIDO' : 'TRIAGEM',
            evidenceKeys: [`foto_alerta_${i + 1}.jpg`],
            assignedTo: 'Fiscal ' + randomFrom(nomes),
            resolvedAt: status === 'RESOLVIDO' ? new Date().toISOString() : undefined,
            location: { type: 'Point', coordinates: [lng, lat] },
            timeline: [
                { stage: 'TRIAGEM', action: 'Alerta gerado por monitoramento satelital', timestamp: new Date('2024-04-01') },
                ...(status === 'RESOLVIDO' ? [{ stage: 'RESOLVIDO', action: 'Fiscalização realizada in-loco e infração sanada', timestamp: new Date() }] : [])
            ]
        });
    }
    await EnvironmentalAlertModel.insertMany(envAlerts);
    console.log(`Inserted ${envAlerts.length} alertas ambientais.`);
    const templates = [
        {
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            name: 'Notificação de IPTU / PGV 2024',
            version: 1,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>NOTIFICAÇÃO DE LANÇAMENTO FISCAL - IPTU 2024</h2>
          <p>Prezado(a) proprietário(a),</p>
          <p>Notificamos o lançamento tributário do imóvel sob inscrição <strong>{{inscricaoImobiliaria}}</strong>.</p>
          <p>Valor Venal do Terreno: R$ {{valorTerreno}}<br/>
          Valor Venal da Construção: R$ {{valorConstrucao}}<br/>
          <strong>Valor Venal Total: R$ {{valorTotal}}</strong></p>
          <p>Ubatuba, {{dataNotificacao}}</p>
        </div>
      `,
            variables: ['inscricaoImobiliaria', 'valorTerreno', 'valorConstrucao', 'valorTotal', 'dataNotificacao'],
            isActive: true
        },
        {
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            name: 'Notificação para Limpeza de Lote / Terreno Sujo',
            version: 1,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>NOTIFICAÇÃO DE LIMPEZA E ROÇADA DE TERRENO</h2>
          <p>Prezado(a),</p>
          <p>Foi constatado pela fiscalização de posturas municipais que o lote situado em <strong>{{endereco}}</strong> encontra-se com mato alto e entulho.</p>
          <p>Solicitamos a limpeza imediata no prazo de 15 (quinze) dias, sob pena de multa.</p>
        </div>
      `,
            variables: ['endereco'],
            isActive: true
        },
        {
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            name: 'Notificação de Cadastro e REURB',
            version: 1,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>CADASTRAMENTO REURB - REGULARIZAÇÃO OPERACIONAL</h2>
          <p>Sr(a). {{nomeResponsavel}},</p>
          <p>Comunicamos o início do levantamento fundiário do núcleo <strong>{{nomeNucleo}}</strong>.</p>
        </div>
      `,
            variables: ['nomeResponsavel', 'nomeNucleo'],
            isActive: true
        }
    ];
    const insertedTemplates = await LetterTemplateModel.insertMany(templates);
    console.log(`Inserted ${insertedTemplates.length} templates de cartas.`);
    const letterBatches = [];
    const BATCH_STATUSES = ['RASCUNHO', 'GERANDO', 'PRONTO', 'ENVIADO', 'ERRO'];
    for (let i = 1; i <= 5; i++) {
        const template = randomFrom(insertedTemplates);
        letterBatches.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            templateId: template._id,
            templateName: template.name,
            templateVersion: template.version,
            protocol: `LOTE-NOT-2024-${pad(i, 4)}`,
            status: randomFrom(BATCH_STATUSES),
            filter: { bairro: 'Perequê-Açu', setor: i },
            letters: [
                { recipient: 'Morador 1', address: 'Rua Principal, 100', variables: {} },
                { recipient: 'Morador 2', address: 'Rua Principal, 200', variables: {} }
            ]
        });
    }
    await LetterBatchModel.insertMany(letterBatches);
    console.log(`Inserted ${letterBatches.length} lotes de envio de cartas.`);
    const ZONAS = [
        { code: 'ZR1', name: 'Zona Residencial 1', desc: 'Residencial de baixa densidade', baseLand: 400, baseConst: 800, aliquota: 0.004, lat: -23.43, lng: -45.08 },
        { code: 'ZCC', name: 'Zona Central Comercial', desc: 'Comércio e serviços central', baseLand: 1200, baseConst: 2000, aliquota: 0.006, lat: -23.44, lng: -45.06 },
        { code: 'ZR2', name: 'Zona Residencial 2', desc: 'Residencial de média densidade', baseLand: 600, baseConst: 1000, aliquota: 0.005, lat: -23.45, lng: -45.10 },
    ];
    const zones = ZONAS.map((z) => ({
        tenantId: TENANT_OID,
        projectId: DEMO_PROJECT_ID,
        code: z.code,
        name: z.name,
        description: z.desc,
        baseLandValue: z.baseLand,
        baseConstructionValue: z.baseConst,
        aliquotaIptu: z.aliquota,
        geometry: makeBbox(z.lat, z.lng, 0.02),
    }));
    await PgvZoneModel.insertMany(zones);
    console.log(`Inserted ${zones.length} zonas PGV.`);
    const faces = [];
    for (let i = 0; i < 12; i++) {
        const zone = ZONAS[i % ZONAS.length];
        const lat = zone.lat + (i * 0.003);
        const lng = zone.lng + (i * 0.002);
        faces.push({
            tenantId: TENANT_OID,
            projectId: DEMO_PROJECT_ID,
            code: `FACE-${pad(i + 1, 3)}`,
            logradouro: randomFrom(LOGRADOUROS),
            zoneCode: zone.code,
            landValuePerSqm: zone.baseLand + randomInt(-50, 150),
            geometry: {
                type: 'LineString',
                coordinates: [
                    [lng, lat],
                    [lng + 0.005, lat + 0.003],
                ],
            },
        });
    }
    await PgvFaceModel.insertMany(faces);
    console.log(`Inserted ${faces.length} faces PGV.`);
    const TIPOS = ['INICIAL', 'REINSPECAO', 'VISTORIA_ESPECIAL', 'CONFERENCIA'];
    const STATUSES = ['RASCUNHO', 'ENVIADA', 'EM_ANALISE', 'APROVADA', 'REJEITADA'];
    const OBSERVACOES = [
        'Imóvel em conformidade com o cadastro.',
        'Pendência de documentação do proprietário.',
        'Construção irregular identificada.',
        'Vistoria realizada sem intercorrências.',
        'Necessário agendamento de reinspenção.',
        'Divergência na metragem do terreno.',
    ];
    const vistorias = [];
    for (let i = 0; i < 35; i++) {
        const parcel = insertedParcels[i % insertedParcels.length];
        const tipo = randomFrom(TIPOS);
        const status = randomFrom(STATUSES);
        const data = new Date(2024, randomInt(0, 11), randomInt(1, 28));
        vistorias.push({
            tenantId: TENANT_OID,
            parcelId: parcel._id,
            tipo,
            data,
            observacoes: randomFrom(OBSERVACOES),
            status,
            fotos: i % 3 === 0 ? [`foto_${i}_1.jpg`, `foto_${i}_2.jpg`] : [],
            historico: [
                { status: 'RASCUNHO', observacao: 'Vistoria criada', userId: 'seed', timestamp: new Date(data.getTime() - 86400000) },
                { status, observacao: `Vistoria ${status.toLowerCase()}`, userId: 'seed', timestamp: data },
            ],
            operadorId: 'seed',
        });
    }
    await VistoriaModel.insertMany(vistorias);
    console.log(`Inserted ${vistorias.length} vistorias.`);
    await mongoose_1.default.disconnect();
    console.log('Done. Demo seed complete.');
    console.log(`\nTenant ID used: ${TENANT_OID} (ObjectId for 'demo-tenant')`);
    console.log(`Project ID used: ${DEMO_PROJECT_ID}`);
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=demo-seed.js.map