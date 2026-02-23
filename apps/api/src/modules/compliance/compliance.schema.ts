import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComplianceChecklistStatus = 'OK' | 'PENDENTE' | 'EXPIRADO';

@Schema({ timestamps: true, collection: 'compliance_profiles' })
export class ComplianceProfile {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  company?: {
    legalName?: string;
    cnpj?: string;
    mdRegistry?: string;
    mdRegistryValidUntil?: string;
    creaCauNumber?: string;
    creaCauValidUntil?: string;
    attachments?: Array<{ name: string; key: string; uploadedAt?: string }>;
  };

  @Prop({ type: [Object], default: [] })
  technicalResponsibles!: Array<{
    id: string;
    name: string;
    documentId?: string;
    creaCauNumber?: string;
    registryType?: 'CREA' | 'CAU';
    validUntil?: string;
    attachments?: Array<{ name: string; key: string; uploadedAt?: string }>;
    createdAt: string;
    updatedAt?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  artsRrts!: Array<{
    id: string;
    type: 'ART' | 'RRT';
    number: string;
    issueDate?: string;
    validUntil?: string;
    responsibleId?: string;
    surveyId?: string;
    projectRef?: string;
    fileKey?: string;
    createdAt: string;
    updatedAt?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  cats!: Array<{
    id: string;
    number: string;
    issueDate?: string;
    validUntil?: string;
    responsibleId?: string;
    surveyId?: string;
    projectRef?: string;
    fileKey?: string;
    createdAt: string;
    updatedAt?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  team!: Array<{
    id: string;
    name: string;
    role: string;
    skills?: string[];
    assignments?: string[];
    curriculumKey?: string;
    evidenceKeys?: string[];
    createdAt: string;
    updatedAt?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  checklist!: Array<{
    id: string;
    requirementCode: string;
    title: string;
    status: ComplianceChecklistStatus;
    notes?: string;
    evidenceKeys?: string[];
    updatedAt: string;
    updatedBy?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  auditLog!: Array<{
    id: string;
    actorId?: string;
    action: string;
    section: string;
    referenceId?: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
}

export type ComplianceProfileDocument = ComplianceProfile & Document;

export const ComplianceProfileSchema = SchemaFactory.createForClass(ComplianceProfile);
ComplianceProfileSchema.index({ tenantId: 1, projectId: 1 }, { unique: true });

