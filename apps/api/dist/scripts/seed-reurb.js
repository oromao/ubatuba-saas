"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const object_storage_service_1 = require("../modules/shared/object-storage.service");
const reurb_schema_1 = require("../modules/reurb/reurb.schema");
const TENANT_SLUG = process.env.TENANT_SLUG ?? 'demo';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@demo.local';
const PROJECT_NAME = process.env.REURB_PROJECT_NAME ?? 'REURB-S Demo Ubatuba';
const FAMILY_COUNT = Number(process.env.REURB_FAMILY_COUNT ?? '10');
const UNIT_COUNT = Number(process.env.REURB_UNIT_COUNT ?? '10');
const PROJECT_STATUS = process.env.REURB_PROJECT_STATUS ?? 'EM_ANALISE';
const nowIso = () => new Date().toISOString();
const makeDocKey = (tenantId, projectId, scope, entityId, name) => `tenants/${tenantId}/reurb/${projectId}/${scope}/${entityId}/${Date.now()}-${name}`;
const pushDocument = (entity, doc) => {
    if (!entity.documents)
        entity.documents = [];
    entity.documents.push(doc);
};
const main = async () => {
    const mongoUrl = process.env.MONGO_URL ??
        'mongodb://root:rootpass@localhost:27017/flydea?authSource=admin';
    await mongoose_1.default.connect(mongoUrl);
    const connection = mongoose_1.default.connection;
    const tenants = connection.collection('tenants');
    const users = connection.collection('users');
    const tenant = await tenants.findOne({ slug: TENANT_SLUG });
    if (!tenant?._id) {
        throw new Error(`Tenant ${TENANT_SLUG} nao encontrado`);
    }
    const tenantId = tenant._id;
    const admin = await users.findOne({ email: ADMIN_EMAIL });
    if (!admin?._id) {
        throw new Error(`Usuario admin ${ADMIN_EMAIL} nao encontrado`);
    }
    const adminId = admin._id;
    const TenantConfig = mongoose_1.default.model('ReurbTenantConfig', reurb_schema_1.TenantConfigSchema);
    const ReurbProject = mongoose_1.default.model('ReurbProject', reurb_schema_1.ReurbProjectSchema);
    const ReurbFamily = mongoose_1.default.model('ReurbFamily', reurb_schema_1.ReurbFamilySchema);
    const ReurbUnit = mongoose_1.default.model('ReurbUnit', reurb_schema_1.ReurbUnitSchema);
    const ReurbNotificationTemplate = mongoose_1.default.model('ReurbNotificationTemplate', reurb_schema_1.ReurbNotificationTemplateSchema);
    const ReurbNotification = mongoose_1.default.model('ReurbNotification', reurb_schema_1.ReurbNotificationSchema);
    await TenantConfig.findOneAndUpdate({ tenantId }, {
        tenantId,
        reurbEnabled: true,
        requiredFamilyFields: ['familyCode', 'nucleus', 'responsibleName', 'status'],
        documentNaming: {
            familyFolder: 'familias',
            spreadsheetFolder: 'planilha',
            titlesFolder: 'titulos',
            approvedDocumentsFolder: 'documentos_aprovados',
            requiredDocumentTypes: ['RG', 'CPF', 'ComprovanteEndereco'],
            requiredProjectDocumentTypes: ['Planta', 'Memorial'],
            requiredUnitDocumentTypes: ['Foto', 'Confrontantes'],
        },
        validationRules: {
            blockOnPendingDocumentIssues: true,
            requireAptaStatusForExports: false,
            requireAptaStatusForCartorioPackage: true,
            failOnMissingRequiredFields: true,
        },
    }, { upsert: true, new: true });
    const existingProject = await ReurbProject.findOne({ tenantId, name: PROJECT_NAME }).exec();
    const project = existingProject ??
        (await ReurbProject.create({
            tenantId,
            name: PROJECT_NAME,
            area: 'Centro',
            reurbType: 'REURB-S',
            status: PROJECT_STATUS,
            startDate: nowIso(),
            responsibles: ['Coord. REURB', 'Equipe Campo'],
            metadata: { seeded: true },
            statusHistory: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    previousStatus: 'RASCUNHO',
                    nextStatus: PROJECT_STATUS,
                    observation: 'Seed automático',
                    actorId: adminId,
                    at: nowIso(),
                },
            ],
            documents: [],
            createdBy: adminId,
            updatedBy: adminId,
        }));
    const projectId = project._id;
    const storage = new object_storage_service_1.ObjectStorageService();
    const seedFamilies = [];
    for (let i = 1; i <= FAMILY_COUNT; i += 1) {
        seedFamilies.push({
            tenantId,
            projectId,
            familyCode: `FAM-${String(i).padStart(3, '0')}`,
            nucleus: i % 2 === 0 ? 'N1' : 'N2',
            responsibleName: `Responsavel ${i}`,
            cpf: `000000000${i}`.slice(0, 11),
            address: `Rua ${i}, ${100 + i}`,
            membersCount: 2 + (i % 4),
            monthlyIncome: 1200 + i * 100,
            status: i % 3 === 0 ? 'IRREGULAR' : 'APTA',
            data: { seeded: true },
            documents: [],
            createdBy: adminId,
            updatedBy: adminId,
        });
    }
    await ReurbFamily.deleteMany({ tenantId, projectId, familyCode: /FAM-/ });
    const families = await ReurbFamily.insertMany(seedFamilies);
    await ReurbUnit.deleteMany({ tenantId, projectId, code: /UND-/ });
    const units = await ReurbUnit.insertMany(Array.from({ length: UNIT_COUNT }).map((_, index) => ({
        tenantId,
        projectId,
        code: `UND-${String(index + 1).padStart(3, '0')}`,
        block: `Q${(index % 4) + 1}`,
        lot: `L${(index % 7) + 1}`,
        address: `Travessa ${index + 1}`,
        area: 85 + index * 2,
        familyIds: [families[index % families.length]._id],
        metadata: { seeded: true },
        documents: [],
        createdBy: adminId,
        updatedBy: adminId,
    })));
    const projectDocKey = makeDocKey(String(tenantId), String(projectId), 'project', String(projectId), 'planta.txt');
    await storage.putObject({
        key: projectDocKey,
        content: Buffer.from('Planta REURB mock', 'utf-8'),
        contentType: 'text/plain',
    });
    pushDocument(project, {
        id: (0, crypto_1.randomUUID)(),
        documentType: 'Planta',
        name: 'planta.txt',
        key: projectDocKey,
        version: 1,
        status: 'APROVADO',
        metadata: { seeded: true },
        uploadedAt: nowIso(),
        uploadedBy: adminId,
    });
    const memorialKey = makeDocKey(String(tenantId), String(projectId), 'project', String(projectId), 'memorial.txt');
    await storage.putObject({
        key: memorialKey,
        content: Buffer.from('Memorial descritivo mock', 'utf-8'),
        contentType: 'text/plain',
    });
    pushDocument(project, {
        id: (0, crypto_1.randomUUID)(),
        documentType: 'Memorial',
        name: 'memorial.txt',
        key: memorialKey,
        version: 1,
        status: 'APROVADO',
        metadata: { seeded: true },
        uploadedAt: nowIso(),
        uploadedBy: adminId,
    });
    await project.save();
    for (const family of families.slice(0, 5)) {
        const rgKey = makeDocKey(String(tenantId), String(projectId), 'families', String(family._id), 'rg.txt');
        await storage.putObject({
            key: rgKey,
            content: Buffer.from(`RG fake ${family.familyCode}`, 'utf-8'),
            contentType: 'text/plain',
        });
        pushDocument(family, {
            id: (0, crypto_1.randomUUID)(),
            documentType: 'RG',
            name: 'rg.txt',
            key: rgKey,
            version: 1,
            status: 'APROVADO',
            metadata: { seeded: true },
            uploadedAt: nowIso(),
            uploadedBy: adminId,
        });
        await family.save();
    }
    for (const unit of units.slice(0, 5)) {
        const fotoKey = makeDocKey(String(tenantId), String(projectId), 'units', String(unit._id), 'foto.txt');
        await storage.putObject({
            key: fotoKey,
            content: Buffer.from(`Foto mock ${unit.code}`, 'utf-8'),
            contentType: 'text/plain',
        });
        pushDocument(unit, {
            id: (0, crypto_1.randomUUID)(),
            documentType: 'Foto',
            name: 'foto.txt',
            key: fotoKey,
            version: 1,
            status: 'APROVADO',
            metadata: { seeded: true },
            uploadedAt: nowIso(),
            uploadedBy: adminId,
        });
        await unit.save();
    }
    await ReurbNotificationTemplate.deleteMany({ tenantId, projectId, name: 'Notificacao inicial' });
    const template = await ReurbNotificationTemplate.create({
        tenantId,
        projectId,
        name: 'Notificacao inicial',
        version: 1,
        subject: 'Comunicado {{nome}}',
        body: 'Prezado {{nome}}, favor comparecer.',
        variables: ['nome'],
        isActive: true,
    });
    await ReurbNotification.deleteMany({ tenantId, projectId, templateId: template._id });
    const evidenceKey = makeDocKey(String(tenantId), String(projectId), 'notification_evidence', String(template._id), 'ar.txt');
    await storage.putObject({
        key: evidenceKey,
        content: Buffer.from('AR mock', 'utf-8'),
        contentType: 'text/plain',
    });
    await ReurbNotification.create({
        tenantId,
        projectId,
        templateId: template._id,
        templateName: template.name,
        templateVersion: template.version,
        channel: 'EMAIL',
        to: 'destinatario@demo.local',
        status: 'SENT',
        payload: { nome: 'Beneficiario' },
        evidenceKeys: [evidenceKey],
        sentAt: nowIso(),
        createdBy: adminId,
    });
    console.log(JSON.stringify({
        tenant: TENANT_SLUG,
        projectId: String(projectId),
        families: families.length,
        units: units.length,
        templateId: String(template._id),
    }, null, 2));
    await mongoose_1.default.disconnect();
};
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-reurb.js.map