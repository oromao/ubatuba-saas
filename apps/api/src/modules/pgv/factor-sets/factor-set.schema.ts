import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

type PgvFactorItem = {
  tipo: string;
  chave: string;
  valorMultiplicador: number;
};

type PgvConstructionValue = {
  uso: string;
  padraoConstrutivo: string;
  valorM2: number;
};

@Schema({ timestamps: true, collection: 'pgv_factor_sets' })
export class PgvFactorSet {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({
    type: [{ tipo: String, chave: String, valorMultiplicador: Number }],
    default: [],
  })
  fatoresTerreno!: PgvFactorItem[];

  @Prop({
    type: [{ tipo: String, chave: String, valorMultiplicador: Number }],
    default: [],
  })
  fatoresConstrucao!: PgvFactorItem[];

  @Prop({
    type: [{ uso: String, padraoConstrutivo: String, valorM2: Number }],
    default: [],
  })
  valoresConstrucaoM2!: PgvConstructionValue[];

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type PgvFactorSetDocument = PgvFactorSet & Document;

export const PgvFactorSetSchema = SchemaFactory.createForClass(PgvFactorSet);
PgvFactorSetSchema.index({ tenantId: 1, projectId: 1 }, { unique: true });
