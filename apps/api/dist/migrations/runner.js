"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path = require("path");
const client_s3_1 = require("@aws-sdk/client-s3");
const geo_1 = require("../common/utils/geo");
const UBATUBA_BBOX = [-45.110, -23.474, -45.040, -23.428];
const migrations = [
    {
        id: '001-create-indexes',
        run: async (connection) => {
            await connection.collection('tenants').createIndex({ slug: 1 }, { unique: true });
            await connection.collection('users').createIndex({ email: 1 }, { unique: true });
            await connection
                .collection('memberships')
                .createIndex({ tenantId: 1, userId: 1 }, { unique: true });
            await connection
                .collection('processes')
                .createIndex({ tenantId: 1, protocolNumber: 1 }, { unique: true });
            await connection
                .collection('environmentalalerts')
                .createIndex({ location: '2dsphere' });
            await connection.collection('assets').createIndex({ location: '2dsphere' });
            await connection
                .collection('refreshtokens')
                .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            await connection
                .collection('passwordresettokens')
                .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        },
    },
    {
        id: '002-seed-demo',
        run: async (connection) => {
            const tenants = connection.collection('tenants');
            const users = connection.collection('users');
            const memberships = connection.collection('memberships');
            const processes = connection.collection('processes');
            const alerts = connection.collection('environmentalalerts');
            const assets = connection.collection('assets');
            const existing = await tenants.findOne({ slug: 'demo' });
            let tenantId = existing?._id;
            if (!tenantId) {
                const tenantInsert = await tenants.insertOne({
                    name: 'FlyDea Demo',
                    slug: 'demo',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                tenantId = tenantInsert.insertedId;
            }
            const admin = await users.findOne({ email: 'admin@demo.local' });
            let userId = admin?._id;
            if (!userId) {
                const passwordHash = await bcrypt.hash('Admin@12345', 10);
                const userInsert = await users.insertOne({
                    email: 'admin@demo.local',
                    passwordHash,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                userId = userInsert.insertedId;
            }
            const membership = await memberships.findOne({ tenantId, userId });
            if (!membership) {
                await memberships.insertOne({
                    tenantId,
                    userId,
                    role: 'ADMIN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            const processCount = await processes.countDocuments({ tenantId });
            if (processCount === 0) {
                const items = Array.from({ length: 5 }).map((_, index) => ({
                    tenantId,
                    protocolNumber: `PR-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`,
                    title: `Processo territorial ${index + 1}`,
                    owner: 'Secretaria de Obras',
                    status: 'EM_ANALISE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));
                await processes.insertMany(items);
            }
            const alertCount = await alerts.countDocuments({ tenantId });
            if (alertCount === 0) {
                await alerts.insertMany(Array.from({ length: 5 }).map((_, index) => ({
                    tenantId,
                    title: `Alerta ambiental ${index + 1}`,
                    level: 'MEDIO',
                    status: 'ABERTO',
                    location: { type: 'Point', coordinates: [-46.6 + index * 0.01, -23.5] },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })));
            }
            const assetCount = await assets.countDocuments({ tenantId });
            if (assetCount === 0) {
                await assets.insertMany(Array.from({ length: 5 }).map((_, index) => ({
                    tenantId,
                    name: `Ativo ${index + 1}`,
                    category: 'Infraestrutura',
                    status: 'ATIVO',
                    location: { type: 'Point', coordinates: [-46.6 + index * 0.02, -23.55] },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })));
            }
        },
    },
    {
        id: '003-seed-gis',
        run: async (connection) => {
            const tenants = connection.collection('tenants');
            const layers = connection.collection('layers');
            const areas = connection.collection('areas');
            const uploads = connection.collection('uploads');
            const projects = connection.collection('projects');
            const parcels = connection.collection('parcels');
            const parcelBuildings = connection.collection('parcel_buildings');
            const parcelSocioeconomic = connection.collection('parcel_socioeconomic');
            const parcelInfrastructure = connection.collection('parcel_infrastructure');
            const logradouros = connection.collection('logradouros');
            const urbanFurniture = connection.collection('urban_furniture');
            const roads = connection.collection('roads');
            const buildings = connection.collection('buildings');
            const pgvZones = connection.collection('pgv_zones');
            const pgvFaces = connection.collection('pgv_faces');
            const pgvFactors = connection.collection('pgv_factors');
            const pgvFactorSets = connection.collection('pgv_factor_sets');
            const pgvVersions = connection.collection('pgv_versions');
            const pgvValuations = connection.collection('pgv_valuations');
            const pgvAssessments = connection.collection('pgv_assessments');
            await layers.createIndex({ tenantId: 1, order: 1 });
            await areas.createIndex({ tenantId: 1, group: 1 });
            await areas.createIndex({ geometry: '2dsphere' });
            await uploads.createIndex({ tenantId: 1, status: 1 });
            await projects.createIndex({ tenantId: 1, slug: 1 }, { unique: true });
            await parcels.createIndex({ tenantId: 1, projectId: 1, sqlu: 1 }, { unique: true });
            await parcels.createIndex({ tenantId: 1, projectId: 1, inscription: 1 });
            await parcels.createIndex({ tenantId: 1, projectId: 1, inscricaoImobiliaria: 1 });
            await parcels.createIndex({ tenantId: 1, projectId: 1, updatedAt: -1 });
            await parcels.createIndex({ geometry: '2dsphere' });
            await parcelBuildings.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await parcelSocioeconomic.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await parcelInfrastructure.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await logradouros.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await urbanFurniture.createIndex({ location: '2dsphere' });
            await roads.createIndex({ tenantId: 1, projectId: 1 });
            await roads.createIndex({ tenantId: 1, projectId: 1, osmId: 1 }, { unique: true });
            await roads.createIndex({ geometry: '2dsphere' });
            await buildings.createIndex({ tenantId: 1, projectId: 1 });
            await buildings.createIndex({ tenantId: 1, projectId: 1, osmId: 1 }, { unique: true });
            await buildings.createIndex({ geometry: '2dsphere' });
            await pgvZones.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await pgvZones.createIndex({ geometry: '2dsphere' });
            await pgvFaces.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await pgvFaces.createIndex({ geometry: '2dsphere' });
            await pgvFactors.createIndex({ tenantId: 1, projectId: 1, category: 1, key: 1 }, { unique: true });
            await pgvFactorSets.createIndex({ tenantId: 1, projectId: 1 }, { unique: true });
            await pgvVersions.createIndex({ tenantId: 1, projectId: 1, year: 1 }, { unique: true });
            await pgvValuations.createIndex({ tenantId: 1, projectId: 1, parcelId: 1, versionId: 1 });
            await pgvAssessments.createIndex({ tenantId: 1, projectId: 1, parcelId: 1, versao: 1 }, { unique: true });
            const tenant = await tenants.findOne({ slug: 'demo' });
            if (!tenant)
                return;
            const tenantId = tenant._id;
            const workspace = `tenant_${tenant.slug}`;
            const rasterLayerName = 'ortomosaico_mock';
            const now = new Date();
            let project = await projects.findOne({ tenantId, slug: 'demo' });
            if (!project) {
                const projectInsert = await projects.insertOne({
                    tenantId,
                    name: 'Projeto Demo',
                    slug: 'demo',
                    isDefault: true,
                    createdAt: now,
                    updatedAt: now,
                });
                project = await projects.findOne({ _id: projectInsert.insertedId });
            }
            const projectId = project?._id;
            if (!projectId)
                return;
            await projects.updateOne({ _id: projectId }, {
                $set: {
                    defaultCenter: [-45.098, -23.448],
                    defaultZoom: 14,
                    defaultBbox: UBATUBA_BBOX,
                },
            });
            const uploadKey = `tenants/${tenantId}/rasters/ortomosaico-mock.tif`;
            const uploadResult = await uploadMockGeotiff(uploadKey);
            const existingUpload = await uploads.findOne({ tenantId, key: uploadKey });
            if (!existingUpload) {
                await uploads.insertOne({
                    tenantId,
                    key: uploadKey,
                    filename: 'ortomosaico-mock.tif',
                    status: 'MOCKED',
                    size: uploadResult.size,
                    mimeType: 'image/tiff',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            await waitForGeoserver();
            await ensureWorkspace(workspace);
            await publishGeoTiff({
                workspace,
                store: rasterLayerName,
                layerName: rasterLayerName,
                fileBuffer: uploadResult.buffer,
            });
            await uploads.updateOne({ tenantId, key: uploadKey }, { $set: { status: 'PUBLISHED', updatedAt: new Date() } });
            const layerDefinitions = [
                {
                    tenantId,
                    name: 'Mapa base OSM',
                    group: 'Base',
                    type: 'basemap',
                    source: 'external',
                    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    visible: true,
                    opacity: 1,
                    order: 1,
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Base satelite (placeholder)',
                    group: 'Base',
                    type: 'basemap',
                    source: 'external',
                    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    visible: false,
                    opacity: 1,
                    order: 2,
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Planta digitalizada (mock)',
                    group: 'Cadastro Imobiliario',
                    type: 'raster',
                    source: 'geoserver',
                    geoserver: { workspace, layerName: rasterLayerName },
                    visible: true,
                    opacity: 0.75,
                    order: 10,
                    minZoom: 11,
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Ruas (OSM)',
                    group: 'Mobilidade',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/osm/roads/geojson',
                    visible: true,
                    opacity: 0.9,
                    order: 6,
                    geometryType: 'line',
                    style: {
                        lineColor: '#4B5D6B',
                        lineWidth: 2,
                        labelField: 'name',
                    },
                    minZoom: 13,
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Edificacoes (OSM)',
                    group: 'Cadastro Imobiliario',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/osm/buildings/geojson',
                    visible: false,
                    opacity: 0.15,
                    order: 8,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#8A9AA8',
                        lineColor: '#5C6B7A',
                        lineWidth: 1,
                        labelField: 'name',
                    },
                    minZoom: 13,
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Parcelas CTM',
                    group: 'Cadastro Imobiliario',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/pgv/valuations/export/geojson',
                    visible: true,
                    opacity: 0.1,
                    order: 12,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#2D9C97',
                        lineColor: '#0B5560',
                        lineWidth: 2.5,
                        labelField: 'sqlu',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Zonas de valor',
                    group: 'PGV',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/pgv/zones/geojson',
                    visible: false,
                    opacity: 0.3,
                    order: 14,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#6C8CBF',
                        lineColor: '#2D3E5E',
                        lineWidth: 1.2,
                        labelField: 'code',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Faces de quadra',
                    group: 'PGV',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/pgv/faces/geojson',
                    visible: false,
                    opacity: 0.9,
                    order: 16,
                    geometryType: 'line',
                    style: {
                        lineColor: '#BA4A00',
                        lineWidth: 2,
                        labelField: 'code',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Mobiliario urbano',
                    group: 'Infraestrutura',
                    type: 'vector',
                    source: 'api',
                    dataUrl: '/ctm/urban-furniture/geojson',
                    visible: false,
                    opacity: 0.9,
                    order: 18,
                    geometryType: 'point',
                    style: {
                        fillColor: '#F2B77A',
                        lineColor: '#B26A35',
                        lineWidth: 1,
                        labelField: 'type',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Areas cadastrais',
                    group: 'Cadastro Imobiliario',
                    type: 'vector',
                    source: 'api',
                    dataUrl: `/areas?group=${encodeURIComponent('Cadastro Imobiliario')}`,
                    visible: true,
                    opacity: 0.6,
                    order: 20,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#2D9C97',
                        lineColor: '#135B66',
                        lineWidth: 1.2,
                        labelField: 'name',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Limites administrativos',
                    group: 'Limites Administrativos',
                    type: 'vector',
                    source: 'api',
                    dataUrl: `/areas?group=${encodeURIComponent('Limites Administrativos')}`,
                    visible: false,
                    opacity: 0.5,
                    order: 30,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#607D8B',
                        lineColor: '#263238',
                        lineWidth: 1.2,
                        labelField: 'name',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Areas ambientais',
                    group: 'Meio Ambiente',
                    type: 'vector',
                    source: 'api',
                    dataUrl: `/areas?group=${encodeURIComponent('Meio Ambiente')}`,
                    visible: false,
                    opacity: 0.55,
                    order: 40,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#7CB342',
                        lineColor: '#33691E',
                        lineWidth: 1.2,
                        labelField: 'name',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    tenantId,
                    name: 'Corredores de mobilidade',
                    group: 'Mobilidade',
                    type: 'vector',
                    source: 'api',
                    dataUrl: `/areas?group=${encodeURIComponent('Mobilidade')}`,
                    visible: false,
                    opacity: 0.5,
                    order: 50,
                    geometryType: 'polygon',
                    style: {
                        fillColor: '#F2B77A',
                        lineColor: '#B26A35',
                        lineWidth: 1.2,
                        labelField: 'name',
                    },
                    createdAt: now,
                    updatedAt: now,
                },
            ];
            for (const definition of layerDefinitions) {
                const existingLayer = await layers.findOne({ tenantId, name: definition.name });
                if (!existingLayer) {
                    await layers.insertOne(definition);
                }
            }
            await layers.updateOne({ tenantId, name: 'Parcelas CTM' }, {
                $set: {
                    dataUrl: '/pgv/valuations/export/geojson',
                    geometryType: 'polygon',
                    opacity: 0.1,
                    style: {
                        fillColor: '#2D9C97',
                        lineColor: '#0B5560',
                        lineWidth: 2.5,
                        labelField: 'sqlu',
                    },
                },
            });
            const areasCount = await areas.countDocuments({ tenantId });
            if (areasCount === 0) {
                await areas.insertMany([
                    {
                        tenantId,
                        name: 'Area 1 - Cadastro',
                        group: 'Cadastro Imobiliario',
                        color: '#2D9C97',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-46.7, -23.6],
                                    [-46.64, -23.6],
                                    [-46.64, -23.54],
                                    [-46.7, -23.54],
                                    [-46.7, -23.6],
                                ],
                            ],
                        },
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        name: 'Zona Administrativa Norte',
                        group: 'Limites Administrativos',
                        color: '#607D8B',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-46.72, -23.52],
                                    [-46.6, -23.52],
                                    [-46.6, -23.46],
                                    [-46.72, -23.46],
                                    [-46.72, -23.52],
                                ],
                            ],
                        },
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        name: 'Parque Ambiental',
                        group: 'Meio Ambiente',
                        color: '#7CB342',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-46.66, -23.58],
                                    [-46.58, -23.58],
                                    [-46.58, -23.5],
                                    [-46.66, -23.5],
                                    [-46.66, -23.58],
                                ],
                            ],
                        },
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        name: 'Eixo Mobilidade Sul',
                        group: 'Mobilidade',
                        color: '#F2B77A',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-46.68, -23.64],
                                    [-46.56, -23.64],
                                    [-46.56, -23.58],
                                    [-46.68, -23.58],
                                    [-46.68, -23.64],
                                ],
                            ],
                        },
                        createdAt: now,
                        updatedAt: now,
                    },
                ]);
            }
            let logradouro = await logradouros.findOne({ tenantId, projectId });
            if (!logradouro) {
                const logradouroInsert = await logradouros.insertOne({
                    tenantId,
                    projectId,
                    name: 'Rua Central',
                    nome: 'Rua Central',
                    type: 'Rua',
                    tipo: 'Rua',
                    code: 'R-001',
                    codigo: 'R-001',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-45.108, -23.448],
                            [-45.076, -23.448],
                        ],
                    },
                    createdAt: now,
                    updatedAt: now,
                });
                logradouro = await logradouros.findOne({ _id: logradouroInsert.insertedId });
            }
            const logradouroId = logradouro?._id;
            const zoneSeeds = [
                {
                    code: 'ZV-01',
                    name: 'Zona Valor Central',
                    nome: 'Zona Valor Central',
                    description: 'Zona central para testes',
                    descricao: 'Zona central para testes',
                    baseLandValue: 420,
                    valorBaseTerrenoM2: 420,
                    baseConstructionValue: 980,
                    valorBaseConstrucaoM2: 980,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.107, -23.460],
                                [-45.084, -23.460],
                                [-45.084, -23.440],
                                [-45.107, -23.440],
                                [-45.107, -23.460],
                            ],
                        ],
                    },
                },
                {
                    code: 'ZV-02',
                    name: 'Zona Valor Norte',
                    nome: 'Zona Valor Norte',
                    description: 'Zona norte para testes',
                    descricao: 'Zona norte para testes',
                    baseLandValue: 320,
                    valorBaseTerrenoM2: 320,
                    baseConstructionValue: 760,
                    valorBaseConstrucaoM2: 760,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.108, -23.448],
                                [-45.080, -23.448],
                                [-45.080, -23.428],
                                [-45.108, -23.428],
                                [-45.108, -23.448],
                            ],
                        ],
                    },
                },
                {
                    code: 'ZV-03',
                    name: 'Zona Valor Sul',
                    nome: 'Zona Valor Sul',
                    description: 'Zona sul para testes',
                    descricao: 'Zona sul para testes',
                    baseLandValue: 260,
                    valorBaseTerrenoM2: 260,
                    baseConstructionValue: 620,
                    valorBaseConstrucaoM2: 620,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.108, -23.474],
                                [-45.080, -23.474],
                                [-45.080, -23.454],
                                [-45.108, -23.454],
                                [-45.108, -23.474],
                            ],
                        ],
                    },
                },
            ];
            for (const seed of zoneSeeds) {
                const existing = await pgvZones.findOne({ tenantId, projectId, code: seed.code });
                if (!existing) {
                    await pgvZones.insertOne({
                        tenantId,
                        projectId,
                        ...seed,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
            const zones = await pgvZones
                .find({ tenantId, projectId, code: { $in: zoneSeeds.map((seed) => seed.code) } })
                .toArray();
            const zoneMap = new Map(zones.map((zone) => [zone.code, zone]));
            const zoneIds = zoneSeeds
                .map((seed) => zoneMap.get(seed.code)?._id)
                .filter(Boolean);
            const primaryZone = zoneMap.get('ZV-01');
            const faceSeeds = Array.from({ length: 10 }).map((_, index) => {
                const lng = -45.108 + index * 0.0035;
                const zoneId = zoneIds.length ? zoneIds[index % zoneIds.length] : undefined;
                const landValuePerSqm = 480 + index * 12;
                return {
                    code: `F-${String(index + 1).padStart(3, '0')}`,
                    logradouroId,
                    zoneId,
                    zonaValorId: zoneId,
                    landValuePerSqm,
                    valorTerrenoM2: landValuePerSqm,
                    metadados: {
                        lado: index % 2 === 0 ? 'Direita' : 'Esquerda',
                        trecho: `Trecho ${index + 1}`,
                        observacoes: 'Face seed',
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [lng, -23.448],
                            [lng + 0.003, -23.448],
                        ],
                    },
                };
            });
            for (const seed of faceSeeds) {
                const existing = await pgvFaces.findOne({ tenantId, projectId, code: seed.code });
                if (!existing) {
                    await pgvFaces.insertOne({
                        tenantId,
                        projectId,
                        ...seed,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
            const faces = await pgvFaces
                .find({ tenantId, projectId, code: { $in: faceSeeds.map((seed) => seed.code) } })
                .toArray();
            const faceMap = new Map(faces.map((face) => [face.code, face]));
            const faceIds = faceSeeds
                .map((seed) => faceMap.get(seed.code)?._id)
                .filter(Boolean);
            const primaryFace = faceMap.get('F-001');
            const parcelsCount = await parcels.countDocuments({ tenantId, projectId });
            if (parcelsCount === 0) {
                const parcelDocs = [];
                const cols = 5;
                const rows = 6;
                const startLng = -45.108;
                const startLat = -23.466;
                const stepLng = 0.006;
                const stepLat = 0.006;
                const sizeLng = 0.004;
                const sizeLat = 0.004;
                let index = 0;
                for (let row = 0; row < rows; row += 1) {
                    for (let col = 0; col < cols; col += 1) {
                        const lng0 = startLng + col * stepLng;
                        const lat0 = startLat + row * stepLat;
                        const lng1 = lng0 + sizeLng;
                        const lat1 = lat0 + sizeLat;
                        const geometry = {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [lng0, lat0],
                                    [lng1, lat0],
                                    [lng1, lat1],
                                    [lng0, lat1],
                                    [lng0, lat0],
                                ],
                            ],
                        };
                        const sqlu = `001-001-${String(index + 1).padStart(3, '0')}-001`;
                        const numero = String(100 + index);
                        const inscricao = `INS-${String(index + 1).padStart(4, '0')}`;
                        const statusCadastral = index % 9 === 0 ? 'CONFLITO' : 'ATIVO';
                        const area = (0, geo_1.calculateGeometryArea)(geometry);
                        const zoneId = zoneIds.length ? zoneIds[index % zoneIds.length] : undefined;
                        const faceId = faceIds.length ? faceIds[index % faceIds.length] : undefined;
                        parcelDocs.push({
                            tenantId,
                            projectId,
                            sqlu,
                            inscricaoImobiliaria: inscricao,
                            inscription: inscricao,
                            enderecoPrincipal: {
                                logradouro: 'Rua Central',
                                numero,
                                bairro: 'Centro',
                                cidade: 'Sao Paulo',
                                uf: 'SP',
                            },
                            mainAddress: `Rua Central, ${numero}`,
                            statusCadastral,
                            status: statusCadastral,
                            observacoes: 'Parcela seed',
                            logradouroId,
                            zoneId,
                            faceId,
                            geometry,
                            areaTerreno: area,
                            area,
                            createdAt: now,
                            updatedAt: now,
                        });
                        index += 1;
                    }
                }
                await parcels.insertMany(parcelDocs);
            }
            const seededParcels = await parcels.find({ tenantId, projectId }).toArray();
            const parcelIds = seededParcels.map((parcel) => parcel._id);
            const buildingCount = await parcelBuildings.countDocuments({ tenantId, projectId });
            if (buildingCount === 0) {
                await parcelBuildings.insertMany(parcelIds.map((parcelId, index) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    useType: index % 2 === 0 ? 'Residencial' : 'Comercial',
                    constructionStandard: index % 2 === 0 ? 'Medio' : 'Alto',
                    builtArea: 180 + index * 12,
                    floors: index % 2 === 0 ? 2 : 3,
                    constructionYear: 2005 + index,
                    occupancyType: 'Ocupado',
                    uso: index % 2 === 0 ? 'Residencial' : 'Comercial',
                    padraoConstrutivo: index % 2 === 0 ? 'Medio' : 'Alto',
                    areaConstruida: 180 + index * 12,
                    pavimentos: index % 2 === 0 ? 2 : 3,
                    anoConstrucao: 2005 + index,
                    tipoOcupacao: 'Ocupado',
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const socioCount = await parcelSocioeconomic.countDocuments({ tenantId, projectId });
            if (socioCount === 0) {
                await parcelSocioeconomic.insertMany(parcelIds.map((parcelId, index) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    incomeBracket: index % 2 === 0 ? 'MEDIA' : 'ALTA',
                    residents: 3 + index,
                    vulnerabilityIndicator: index % 2 === 0 ? 'BAIXA' : 'MEDIA',
                    faixaRenda: index % 2 === 0 ? 'MEDIA' : 'ALTA',
                    moradores: 3 + index,
                    vulnerabilidade: index % 2 === 0 ? 'BAIXA' : 'MEDIA',
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const infraCount = await parcelInfrastructure.countDocuments({ tenantId, projectId });
            if (infraCount === 0) {
                await parcelInfrastructure.insertMany(parcelIds.map((parcelId) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    water: true,
                    sewage: true,
                    electricity: true,
                    pavingType: 'Asfalto',
                    publicLighting: true,
                    garbageCollection: true,
                    agua: true,
                    esgoto: true,
                    energia: true,
                    pavimentacao: 'Asfalto',
                    iluminacao: true,
                    coleta: true,
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const furnitureCount = await urbanFurniture.countDocuments({ tenantId, projectId });
            if (furnitureCount === 0) {
                await urbanFurniture.insertMany([
                    {
                        tenantId,
                        projectId,
                        type: 'Poste',
                        tipo: 'Poste',
                        location: { type: 'Point', coordinates: [-46.645, -23.55] },
                        geometry: { type: 'Point', coordinates: [-46.645, -23.55] },
                        condition: 'Bom',
                        estadoConservacao: 'Bom',
                        notes: 'Poste de iluminacao',
                        observacao: 'Poste de iluminacao',
                        photoUrl: 'https://placehold.co/640x480',
                        fotoUrl: 'https://placehold.co/640x480',
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        projectId,
                        type: 'Banco',
                        tipo: 'Banco',
                        location: { type: 'Point', coordinates: [-46.635, -23.55] },
                        geometry: { type: 'Point', coordinates: [-46.635, -23.55] },
                        condition: 'Regular',
                        estadoConservacao: 'Regular',
                        notes: 'Banco em praca',
                        observacao: 'Banco em praca',
                        photoUrl: 'https://placehold.co/640x480',
                        fotoUrl: 'https://placehold.co/640x480',
                        createdAt: now,
                        updatedAt: now,
                    },
                ]);
            }
            const factorCount = await pgvFactors.countDocuments({ tenantId, projectId });
            if (factorCount === 0) {
                await pgvFactors.insertMany([
                    {
                        tenantId,
                        projectId,
                        category: 'LAND',
                        key: 'padrao',
                        label: 'Fator terreno padrao',
                        value: 1,
                        description: 'Fator base para terreno',
                        isDefault: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        projectId,
                        category: 'CONSTRUCTION',
                        key: 'padrao',
                        label: 'Fator construcao padrao',
                        value: 1,
                        description: 'Fator base para construcao',
                        isDefault: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                ]);
            }
            const factorSetCount = await pgvFactorSets.countDocuments({ tenantId, projectId });
            if (factorSetCount === 0) {
                await pgvFactorSets.insertOne({
                    tenantId,
                    projectId,
                    fatoresTerreno: [
                        { tipo: 'localizacao', chave: 'central', valorMultiplicador: 1.2 },
                        { tipo: 'esquina', chave: 'sim', valorMultiplicador: 1.1 },
                    ],
                    fatoresConstrucao: [
                        { tipo: 'uso', chave: 'residencial', valorMultiplicador: 1 },
                        { tipo: 'uso', chave: 'comercial', valorMultiplicador: 1.25 },
                    ],
                    valoresConstrucaoM2: [
                        { uso: 'Residencial', padraoConstrutivo: 'Medio', valorM2: 1200 },
                        { uso: 'Comercial', padraoConstrutivo: 'Alto', valorM2: 1650 },
                    ],
                    createdAt: now,
                    updatedAt: now,
                });
            }
            let version = await pgvVersions.findOne({ tenantId, projectId, year: 2026 });
            if (!version) {
                const versionInsert = await pgvVersions.insertOne({
                    tenantId,
                    projectId,
                    name: 'PGV 2026',
                    year: 2026,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                });
                version = await pgvVersions.findOne({ _id: versionInsert.insertedId });
            }
            const valuationsCount = await pgvValuations.countDocuments({ tenantId, projectId });
            if (valuationsCount === 0 && version) {
                const landFactor = 1;
                const constructionFactor = 1;
                for (const parcel of seededParcels) {
                    const building = await parcelBuildings.findOne({ tenantId, projectId, parcelId: parcel._id });
                    const landValuePerSqm = primaryFace?.landValuePerSqm ??
                        primaryFace?.valorTerrenoM2 ??
                        primaryZone?.baseLandValue ??
                        primaryZone?.valorBaseTerrenoM2 ??
                        0;
                    const constructionValuePerSqm = primaryZone?.baseConstructionValue ?? primaryZone?.valorBaseConstrucaoM2 ?? 0;
                    const parcelArea = parcel.areaTerreno ?? parcel.area ?? 0;
                    const builtArea = building?.builtArea ?? building?.areaConstruida ?? 0;
                    const landValue = parcelArea * landValuePerSqm * landFactor;
                    const constructionValue = builtArea * constructionValuePerSqm * constructionFactor;
                    const totalValue = landValue + constructionValue;
                    await pgvValuations.insertOne({
                        tenantId,
                        projectId,
                        parcelId: parcel._id,
                        versionId: version._id,
                        landValuePerSqm,
                        landFactor,
                        constructionValuePerSqm,
                        constructionFactor,
                        landValue,
                        constructionValue,
                        totalValue,
                        breakdown: {
                            zoneId: primaryZone?._id,
                            faceId: primaryFace?._id,
                            parcelArea,
                            builtArea,
                        },
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        },
    },
    {
        id: '004-seed-ctm-pgv',
        run: async (connection) => {
            const tenants = connection.collection('tenants');
            const layers = connection.collection('layers');
            const projects = connection.collection('projects');
            const parcels = connection.collection('parcels');
            const parcelBuildings = connection.collection('parcel_buildings');
            const parcelSocioeconomic = connection.collection('parcel_socioeconomic');
            const parcelInfrastructure = connection.collection('parcel_infrastructure');
            const logradouros = connection.collection('logradouros');
            const urbanFurniture = connection.collection('urban_furniture');
            const pgvZones = connection.collection('pgv_zones');
            const pgvFaces = connection.collection('pgv_faces');
            const pgvFactors = connection.collection('pgv_factors');
            const pgvFactorSets = connection.collection('pgv_factor_sets');
            const pgvVersions = connection.collection('pgv_versions');
            const pgvValuations = connection.collection('pgv_valuations');
            const pgvAssessments = connection.collection('pgv_assessments');
            await projects.createIndex({ tenantId: 1, slug: 1 }, { unique: true });
            await parcels.createIndex({ tenantId: 1, projectId: 1, sqlu: 1 }, { unique: true });
            await parcels.createIndex({ tenantId: 1, projectId: 1, inscription: 1 });
            await parcels.createIndex({ tenantId: 1, projectId: 1, inscricaoImobiliaria: 1 });
            await parcels.createIndex({ tenantId: 1, projectId: 1, updatedAt: -1 });
            await parcels.createIndex({ geometry: '2dsphere' });
            await parcelBuildings.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await parcelSocioeconomic.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await parcelInfrastructure.createIndex({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
            await logradouros.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await urbanFurniture.createIndex({ location: '2dsphere' });
            await pgvZones.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await pgvZones.createIndex({ geometry: '2dsphere' });
            await pgvFaces.createIndex({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
            await pgvFaces.createIndex({ geometry: '2dsphere' });
            await pgvFactors.createIndex({ tenantId: 1, projectId: 1, category: 1, key: 1 }, { unique: true });
            await pgvFactorSets.createIndex({ tenantId: 1, projectId: 1 }, { unique: true });
            await pgvVersions.createIndex({ tenantId: 1, projectId: 1, year: 1 }, { unique: true });
            await pgvValuations.createIndex({ tenantId: 1, projectId: 1, parcelId: 1, versionId: 1 });
            await pgvAssessments.createIndex({ tenantId: 1, projectId: 1, parcelId: 1, versao: 1 }, { unique: true });
            const tenant = await tenants.findOne({ slug: 'demo' });
            if (!tenant)
                return;
            const tenantId = tenant._id;
            const now = new Date();
            let project = await projects.findOne({ tenantId, slug: 'demo' });
            if (!project) {
                const projectInsert = await projects.insertOne({
                    tenantId,
                    name: 'Projeto Demo',
                    slug: 'demo',
                    isDefault: true,
                    createdAt: now,
                    updatedAt: now,
                });
                project = await projects.findOne({ _id: projectInsert.insertedId });
            }
            const projectId = project?._id;
            if (!projectId)
                return;
            await layers.updateOne({ tenantId, name: 'Parcelas CTM' }, {
                $set: {
                    dataUrl: '/pgv/valuations/export/geojson',
                    geometryType: 'polygon',
                },
            });
            let logradouro = await logradouros.findOne({ tenantId, projectId });
            if (!logradouro) {
                const logradouroInsert = await logradouros.insertOne({
                    tenantId,
                    projectId,
                    name: 'Rua Central',
                    nome: 'Rua Central',
                    type: 'Rua',
                    tipo: 'Rua',
                    code: 'R-001',
                    codigo: 'R-001',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-45.108, -23.448],
                            [-45.076, -23.448],
                        ],
                    },
                    createdAt: now,
                    updatedAt: now,
                });
                logradouro = await logradouros.findOne({ _id: logradouroInsert.insertedId });
            }
            const logradouroId = logradouro?._id;
            const zoneSeeds = [
                {
                    code: 'ZV-01',
                    name: 'Zona Valor Central',
                    nome: 'Zona Valor Central',
                    description: 'Zona central para testes',
                    descricao: 'Zona central para testes',
                    baseLandValue: 420,
                    valorBaseTerrenoM2: 420,
                    baseConstructionValue: 980,
                    valorBaseConstrucaoM2: 980,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.107, -23.460],
                                [-45.084, -23.460],
                                [-45.084, -23.440],
                                [-45.107, -23.440],
                                [-45.107, -23.460],
                            ],
                        ],
                    },
                },
                {
                    code: 'ZV-02',
                    name: 'Zona Valor Norte',
                    nome: 'Zona Valor Norte',
                    description: 'Zona norte para testes',
                    descricao: 'Zona norte para testes',
                    baseLandValue: 320,
                    valorBaseTerrenoM2: 320,
                    baseConstructionValue: 760,
                    valorBaseConstrucaoM2: 760,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.108, -23.448],
                                [-45.080, -23.448],
                                [-45.080, -23.428],
                                [-45.108, -23.428],
                                [-45.108, -23.448],
                            ],
                        ],
                    },
                },
                {
                    code: 'ZV-03',
                    name: 'Zona Valor Sul',
                    nome: 'Zona Valor Sul',
                    description: 'Zona sul para testes',
                    descricao: 'Zona sul para testes',
                    baseLandValue: 260,
                    valorBaseTerrenoM2: 260,
                    baseConstructionValue: 620,
                    valorBaseConstrucaoM2: 620,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-45.108, -23.474],
                                [-45.080, -23.474],
                                [-45.080, -23.454],
                                [-45.108, -23.454],
                                [-45.108, -23.474],
                            ],
                        ],
                    },
                },
            ];
            for (const seed of zoneSeeds) {
                const existing = await pgvZones.findOne({ tenantId, projectId, code: seed.code });
                if (!existing) {
                    await pgvZones.insertOne({
                        tenantId,
                        projectId,
                        ...seed,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
            const zones = await pgvZones
                .find({ tenantId, projectId, code: { $in: zoneSeeds.map((seed) => seed.code) } })
                .toArray();
            const zoneMap = new Map(zones.map((zone) => [zone.code, zone]));
            const zoneIds = zoneSeeds
                .map((seed) => zoneMap.get(seed.code)?._id)
                .filter(Boolean);
            const primaryZone = zoneMap.get('ZV-01');
            const faceSeeds = Array.from({ length: 10 }).map((_, index) => {
                const lng = -45.108 + index * 0.0035;
                const zoneId = zoneIds.length ? zoneIds[index % zoneIds.length] : undefined;
                const landValuePerSqm = 480 + index * 12;
                return {
                    code: `F-${String(index + 1).padStart(3, '0')}`,
                    logradouroId,
                    zoneId,
                    zonaValorId: zoneId,
                    landValuePerSqm,
                    valorTerrenoM2: landValuePerSqm,
                    metadados: {
                        lado: index % 2 === 0 ? 'Direita' : 'Esquerda',
                        trecho: `Trecho ${index + 1}`,
                        observacoes: 'Face seed',
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [lng, -23.448],
                            [lng + 0.003, -23.448],
                        ],
                    },
                };
            });
            for (const seed of faceSeeds) {
                const existing = await pgvFaces.findOne({ tenantId, projectId, code: seed.code });
                if (!existing) {
                    await pgvFaces.insertOne({
                        tenantId,
                        projectId,
                        ...seed,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
            const faces = await pgvFaces
                .find({ tenantId, projectId, code: { $in: faceSeeds.map((seed) => seed.code) } })
                .toArray();
            const faceMap = new Map(faces.map((face) => [face.code, face]));
            const faceIds = faceSeeds
                .map((seed) => faceMap.get(seed.code)?._id)
                .filter(Boolean);
            const primaryFace = faceMap.get('F-001');
            const parcelsCount = await parcels.countDocuments({ tenantId, projectId });
            if (parcelsCount === 0) {
                const parcelDocs = [];
                const cols = 5;
                const rows = 6;
                const startLng = -45.108;
                const startLat = -23.466;
                const stepLng = 0.006;
                const stepLat = 0.006;
                const sizeLng = 0.004;
                const sizeLat = 0.004;
                let index = 0;
                for (let row = 0; row < rows; row += 1) {
                    for (let col = 0; col < cols; col += 1) {
                        const lng0 = startLng + col * stepLng;
                        const lat0 = startLat + row * stepLat;
                        const lng1 = lng0 + sizeLng;
                        const lat1 = lat0 + sizeLat;
                        const geometry = {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [lng0, lat0],
                                    [lng1, lat0],
                                    [lng1, lat1],
                                    [lng0, lat1],
                                    [lng0, lat0],
                                ],
                            ],
                        };
                        const sqlu = `001-001-${String(index + 1).padStart(3, '0')}-001`;
                        const numero = String(100 + index);
                        const inscricao = `INS-${String(index + 1).padStart(4, '0')}`;
                        const statusCadastral = index % 9 === 0 ? 'CONFLITO' : 'ATIVO';
                        const area = (0, geo_1.calculateGeometryArea)(geometry);
                        const zoneId = zoneIds.length ? zoneIds[index % zoneIds.length] : undefined;
                        const faceId = faceIds.length ? faceIds[index % faceIds.length] : undefined;
                        parcelDocs.push({
                            tenantId,
                            projectId,
                            sqlu,
                            inscricaoImobiliaria: inscricao,
                            inscription: inscricao,
                            enderecoPrincipal: {
                                logradouro: 'Rua Central',
                                numero,
                                bairro: 'Centro',
                                cidade: 'Sao Paulo',
                                uf: 'SP',
                            },
                            mainAddress: `Rua Central, ${numero}`,
                            statusCadastral,
                            status: statusCadastral,
                            observacoes: 'Parcela seed',
                            logradouroId,
                            zoneId,
                            faceId,
                            geometry,
                            areaTerreno: area,
                            area,
                            createdAt: now,
                            updatedAt: now,
                        });
                        index += 1;
                    }
                }
                await parcels.insertMany(parcelDocs);
            }
            const seededParcels = await parcels.find({ tenantId, projectId }).toArray();
            const parcelIds = seededParcels.map((parcel) => parcel._id);
            const buildingCount = await parcelBuildings.countDocuments({ tenantId, projectId });
            if (buildingCount === 0) {
                await parcelBuildings.insertMany(parcelIds.map((parcelId, index) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    useType: index % 2 === 0 ? 'Residencial' : 'Comercial',
                    constructionStandard: index % 2 === 0 ? 'Medio' : 'Alto',
                    builtArea: 180 + index * 12,
                    floors: index % 2 === 0 ? 2 : 3,
                    constructionYear: 2005 + index,
                    occupancyType: 'Ocupado',
                    uso: index % 2 === 0 ? 'Residencial' : 'Comercial',
                    padraoConstrutivo: index % 2 === 0 ? 'Medio' : 'Alto',
                    areaConstruida: 180 + index * 12,
                    pavimentos: index % 2 === 0 ? 2 : 3,
                    anoConstrucao: 2005 + index,
                    tipoOcupacao: 'Ocupado',
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const socioCount = await parcelSocioeconomic.countDocuments({ tenantId, projectId });
            if (socioCount === 0) {
                await parcelSocioeconomic.insertMany(parcelIds.map((parcelId, index) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    incomeBracket: index % 2 === 0 ? 'MEDIA' : 'ALTA',
                    residents: 3 + index,
                    vulnerabilityIndicator: index % 2 === 0 ? 'BAIXA' : 'MEDIA',
                    faixaRenda: index % 2 === 0 ? 'MEDIA' : 'ALTA',
                    moradores: 3 + index,
                    vulnerabilidade: index % 2 === 0 ? 'BAIXA' : 'MEDIA',
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const infraCount = await parcelInfrastructure.countDocuments({ tenantId, projectId });
            if (infraCount === 0) {
                await parcelInfrastructure.insertMany(parcelIds.map((parcelId) => ({
                    tenantId,
                    projectId,
                    parcelId,
                    water: true,
                    sewage: true,
                    electricity: true,
                    pavingType: 'Asfalto',
                    publicLighting: true,
                    garbageCollection: true,
                    agua: true,
                    esgoto: true,
                    energia: true,
                    pavimentacao: 'Asfalto',
                    iluminacao: true,
                    coleta: true,
                    createdAt: now,
                    updatedAt: now,
                })));
            }
            const furnitureCount = await urbanFurniture.countDocuments({ tenantId, projectId });
            if (furnitureCount === 0) {
                await urbanFurniture.insertMany([
                    {
                        tenantId,
                        projectId,
                        type: 'Poste',
                        tipo: 'Poste',
                        location: { type: 'Point', coordinates: [-46.645, -23.55] },
                        geometry: { type: 'Point', coordinates: [-46.645, -23.55] },
                        condition: 'Bom',
                        estadoConservacao: 'Bom',
                        notes: 'Poste de iluminacao',
                        observacao: 'Poste de iluminacao',
                        photoUrl: 'https://placehold.co/640x480',
                        fotoUrl: 'https://placehold.co/640x480',
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        projectId,
                        type: 'Banco',
                        tipo: 'Banco',
                        location: { type: 'Point', coordinates: [-46.635, -23.55] },
                        geometry: { type: 'Point', coordinates: [-46.635, -23.55] },
                        condition: 'Regular',
                        estadoConservacao: 'Regular',
                        notes: 'Banco em praca',
                        observacao: 'Banco em praca',
                        photoUrl: 'https://placehold.co/640x480',
                        fotoUrl: 'https://placehold.co/640x480',
                        createdAt: now,
                        updatedAt: now,
                    },
                ]);
            }
            const factorCount = await pgvFactors.countDocuments({ tenantId, projectId });
            if (factorCount === 0) {
                await pgvFactors.insertMany([
                    {
                        tenantId,
                        projectId,
                        category: 'LAND',
                        key: 'padrao',
                        label: 'Fator terreno padrao',
                        value: 1,
                        description: 'Fator base para terreno',
                        isDefault: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                    {
                        tenantId,
                        projectId,
                        category: 'CONSTRUCTION',
                        key: 'padrao',
                        label: 'Fator construcao padrao',
                        value: 1,
                        description: 'Fator base para construcao',
                        isDefault: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                ]);
            }
            let version = await pgvVersions.findOne({ tenantId, projectId, year: 2026 });
            if (!version) {
                const versionInsert = await pgvVersions.insertOne({
                    tenantId,
                    projectId,
                    name: 'PGV 2026',
                    year: 2026,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                });
                version = await pgvVersions.findOne({ _id: versionInsert.insertedId });
            }
            const valuationsCount = await pgvValuations.countDocuments({ tenantId, projectId });
            if (valuationsCount === 0 && version) {
                const landFactor = 1;
                const constructionFactor = 1;
                for (const parcel of seededParcels) {
                    const building = await parcelBuildings.findOne({
                        tenantId,
                        projectId,
                        parcelId: parcel._id,
                    });
                    const landValuePerSqm = primaryFace?.landValuePerSqm ??
                        primaryFace?.valorTerrenoM2 ??
                        primaryZone?.baseLandValue ??
                        primaryZone?.valorBaseTerrenoM2 ??
                        0;
                    const constructionValuePerSqm = primaryZone?.baseConstructionValue ?? primaryZone?.valorBaseConstrucaoM2 ?? 0;
                    const parcelArea = parcel.areaTerreno ?? parcel.area ?? 0;
                    const builtArea = building?.builtArea ?? building?.areaConstruida ?? 0;
                    const landValue = parcelArea * landValuePerSqm * landFactor;
                    const constructionValue = builtArea * constructionValuePerSqm * constructionFactor;
                    const totalValue = landValue + constructionValue;
                    await pgvValuations.insertOne({
                        tenantId,
                        projectId,
                        parcelId: parcel._id,
                        versionId: version._id,
                        landValuePerSqm,
                        landFactor,
                        constructionValuePerSqm,
                        constructionFactor,
                        landValue,
                        constructionValue,
                        totalValue,
                        breakdown: {
                            zoneId: primaryZone?._id,
                            faceId: primaryFace?._id,
                            parcelArea,
                            builtArea,
                        },
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        },
    },
    {
        id: '005-map-features',
        run: async (connection) => {
            const mapFeatures = connection.collection('map_features');
            await mapFeatures.createIndex({ tenantId: 1, projectId: 1, featureType: 1 });
            await mapFeatures.createIndex({ geometry: '2dsphere' });
        },
    },
];
async function uploadMockGeotiff(key) {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
    const accessKeyId = process.env.MINIO_ACCESS_KEY ?? 'minioadmin';
    const secretAccessKey = process.env.MINIO_SECRET_KEY ?? 'minioadmin';
    const bucket = process.env.MINIO_BUCKET ?? 'flydea-geotiffs';
    const mockPath = await resolveMockPath();
    const client = new client_s3_1.S3Client({
        region: 'us-east-1',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
    });
    try {
        await client.send(new client_s3_1.HeadBucketCommand({ Bucket: bucket }));
    }
    catch {
        await client.send(new client_s3_1.CreateBucketCommand({ Bucket: bucket }));
    }
    const buffer = await (0, promises_1.readFile)(mockPath);
    await client.send(new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/tiff',
    }));
    return { buffer, size: buffer.length };
}
async function resolveMockPath() {
    const candidates = [
        process.env.MOCK_GEOTIFF_PATH,
        path.resolve('/infra/assets/mock-geotiff.tif'),
        path.resolve(process.cwd(), 'infra/assets/mock-geotiff.tif'),
    ].filter((value) => Boolean(value));
    for (const candidate of candidates) {
        try {
            await (0, promises_1.readFile)(candidate);
            return candidate;
        }
        catch {
            continue;
        }
    }
    throw new Error('GeoTIFF mockado nao encontrado');
}
async function ensureWorkspace(workspace) {
    const exists = await geoserverRequest(`/rest/workspaces/${workspace}.json`, {
        method: 'GET',
    });
    if (exists.status === 200)
        return;
    await geoserverRequest('/rest/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: { name: workspace } }),
    });
}
async function publishGeoTiff({ workspace, store, layerName, fileBuffer, }) {
    const upload = await geoserverRequest(`/rest/workspaces/${workspace}/coveragestores/${store}/file.geotiff?coverageName=${layerName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/tiff' },
        body: new Uint8Array(fileBuffer),
    });
    if (![200, 201, 202, 409].includes(upload.status)) {
        const text = await upload.text();
        throw new Error(`Falha ao publicar GeoTIFF: ${upload.status} ${text}`);
    }
    const [minx, miny, maxx, maxy] = UBATUBA_BBOX;
    const bounds = {
        minx,
        maxx,
        miny,
        maxy,
        crs: 'EPSG:4326',
    };
    await geoserverRequest(`/rest/workspaces/${workspace}/coveragestores/${store}/coverages/${layerName}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            coverage: {
                name: layerName,
                nativeCRS: 'EPSG:4326',
                srs: 'EPSG:4326',
                projectionPolicy: 'REPROJECT_TO_DECLARED',
                enabled: true,
                nativeBoundingBox: bounds,
                latLonBoundingBox: bounds,
            },
        }),
    });
}
function geoserverBase() {
    const base = process.env.GEOSERVER_URL ?? 'http://geoserver:8080/geoserver';
    return base.replace(/\/$/, '');
}
function geoserverAuth() {
    const user = process.env.GEOSERVER_USER ?? 'admin';
    const password = process.env.GEOSERVER_PASSWORD ?? 'geoserver';
    return `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
}
async function geoserverRequest(path, options) {
    return fetch(`${geoserverBase()}${path}`, {
        ...options,
        headers: {
            ...(options.headers ?? {}),
            Authorization: geoserverAuth(),
        },
    });
}
async function waitForGeoserver() {
    const attempts = 10;
    for (let i = 0; i < attempts; i += 1) {
        try {
            const res = await geoserverRequest('/rest/about/version.json', { method: 'GET' });
            if (res.ok) {
                return;
            }
        }
        catch {
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    throw new Error('GeoServer nao respondeu a tempo');
}
async function run() {
    const uri = process.env.MONGO_URL;
    if (!uri) {
        throw new Error('MONGO_URL nao configurado');
    }
    await mongoose_1.default.connect(uri);
    const connection = mongoose_1.default.connection;
    const migrationsCollection = connection.collection('migrations');
    for (const migration of migrations) {
        const existing = await migrationsCollection.findOne({ id: migration.id });
        if (existing) {
            continue;
        }
        await migration.run(connection);
        await migrationsCollection.insertOne({ id: migration.id, ranAt: new Date() });
    }
    await connection.close();
}
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=runner.js.map