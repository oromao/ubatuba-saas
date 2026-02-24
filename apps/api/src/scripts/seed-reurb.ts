import mongoose, { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { ObjectStorageService } from '../modules/shared/object-storage.service';
import {
  ReurbFamilySchema,
  ReurbNotificationSchema,
  ReurbNotificationTemplateSchema,
  ReurbProjectSchema,
  ReurbUnitSchema,
  TenantConfigSchema,
} from '../modules/reurb/reurb.schema';

const TENANT_SLUG = process.env.TENANT_SLUG ?? 'demo';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@demo.local';
const PROJECT_NAME = process.env.REURB_PROJECT_NAME ?? 'REURB-S Demo Ubatuba';
const FAMILY_COUNT = Number(process.env.REURB_FAMILY_COUNT ?? '10');
const UNIT_COUNT = Number(process.env.REURB_UNIT_COUNT ?? '10');
const PROJECT_STATUS = process.env.REURB_PROJECT_STATUS ?? 'EM_ANALISE';

const nowIso = () => new Date().toISOString();

const makeDocKey = (tenantId: string, projectId: string, scope: string, entityId: string, name: string) =>
  `tenants/${tenantId}/reurb/${projectId}/${scope}/${entityId}/${Date.now()}-${name}`;

type DocumentEntry = {
  id: string;
  documentType: string;
  name: string;
  key: string;
  version: number;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
  metadata?: Record<string, unknown>;
  uploadedAt: string;
  uploadedBy: Types.ObjectId;
};

type SeedFamily = {
  tenantId: Types.ObjectId;
  projectId: Types.ObjectId;
  familyCode: string;
  nucleus: string;
  responsibleName: string;
  cpf: string;
  address: string;
  membersCount: number;
  monthlyIncome: number;
  status: 'APTA' | 'PENDENTE' | 'IRREGULAR';
  data: Record<string, unknown>;
  documents: DocumentEntry[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
};

const pushDocument = (entity: { documents?: DocumentEntry[] }, doc: DocumentEntry) => {
  if (!entity.documents) entity.documents = [];
  entity.documents.push(doc);
};

const main = async () => {
  const mongoUrl =
    process.env.MONGO_URL ??
    'mongodb://root:rootpass@localhost:27017/flydea?authSource=admin';

  await mongoose.connect(mongoUrl);
  const connection = mongoose.connection;
  const tenants = connection.collection('tenants');
  const users = connection.collection('users');

  const tenant = await tenants.findOne({ slug: TENANT_SLUG });
  if (!tenant?._id) {
    throw new Error(`Tenant ${TENANT_SLUG} nao encontrado`);
  }
  const tenantId = tenant._id as Types.ObjectId;

  const admin = await users.findOne({ email: ADMIN_EMAIL });
  if (!admin?._id) {
    throw new Error(`Usuario admin ${ADMIN_EMAIL} nao encontrado`);
  }
  const adminId = admin._id as Types.ObjectId;

  const TenantConfig = mongoose.model('ReurbTenantConfig', TenantConfigSchema);
  const ReurbProject = mongoose.model('ReurbProject', ReurbProjectSchema);
  const ReurbFamily = mongoose.model('ReurbFamily', ReurbFamilySchema);
  const ReurbUnit = mongoose.model('ReurbUnit', ReurbUnitSchema);
  const ReurbNotificationTemplate = mongoose.model('ReurbNotificationTemplate', ReurbNotificationTemplateSchema);
  const ReurbNotification = mongoose.model('ReurbNotification', ReurbNotificationSchema);

  await TenantConfig.findOneAndUpdate(
    { tenantId },
    {
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
    },
    { upsert: true, new: true },
  );

  const existingProject = await ReurbProject.findOne({ tenantId, name: PROJECT_NAME }).exec();
  const project =
    existingProject ??
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
          id: randomUUID(),
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

  const projectId = project._id as Types.ObjectId;

  const storage = new ObjectStorageService();

  const seedFamilies: SeedFamily[] = [];
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
  const units = await ReurbUnit.insertMany(
    Array.from({ length: UNIT_COUNT }).map((_, index) => ({
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
    })),
  );

  const projectDocKey = makeDocKey(String(tenantId), String(projectId), 'project', String(projectId), 'planta.txt');
  await storage.putObject({
    key: projectDocKey,
    content: Buffer.from('Planta REURB mock', 'utf-8'),
    contentType: 'text/plain',
  });
  pushDocument(project as { documents?: DocumentEntry[] }, {
    id: randomUUID(),
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
  pushDocument(project as { documents?: DocumentEntry[] }, {
    id: randomUUID(),
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
    pushDocument(family as { documents?: DocumentEntry[] }, {
      id: randomUUID(),
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
    pushDocument(unit as { documents?: DocumentEntry[] }, {
      id: randomUUID(),
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

  console.log(
    JSON.stringify(
      {
        tenant: TENANT_SLUG,
        projectId: String(projectId),
        families: families.length,
        units: units.length,
        templateId: String(template._id),
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
