import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../common/guards/roles.decorator';

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'] })
  role!: Role;
}

export type MembershipDocument = Membership & Document;

export const MembershipSchema = SchemaFactory.createForClass(Membership);
