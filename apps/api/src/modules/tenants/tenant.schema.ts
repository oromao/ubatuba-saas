import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  website?: string;
}

interface Aliquotas {
  iptuResidencial?: number;
  iptuComercial?: number;
  iptuIndustrial?: number;
  iptuTerritorial?: number;
  itbi?: number;
  taxaColetaLixo?: number;
  taxaIluminacao?: number;
}

interface Lei {
  numero: string;
  ano: number;
  titulo: string;
  descricao?: string;
  tipo?: 'LEI_MUNICIPAL' | 'DECRETO' | 'PORTARIA' | 'INSTRUCAO_NORMATIVA';
}

interface ModulosHabilitados {
  ctm?: boolean;
  pgv?: boolean;
  reurb?: boolean;
  fiscalizacao?: boolean;
  alvaraObras?: boolean;
  alvaraFuncionamento?: boolean;
  cemiterio?: boolean;
  citizen156?: boolean;
  obrasPublicas?: boolean;
  observatorio?: boolean;
}

interface MunicipalConfig {
  brasao?: string;
  logo?: string;
  cnpjMunicipio?: string;
  ibgeCode?: string;
  uf?: string;
  endereco?: Endereco;
  aliquotasPadrao?: Aliquotas;
  leis?: Lei[];
  modulosHabilitados?: ModulosHabilitados;
  pgvPadrao?: {
    valorBaseTerrenoM2?: number;
    valorBaseConstrucaoM2?: number;
    anoBase?: number;
  };
  configuracaoRegional?: {
    timezone?: string;
    locale?: string;
  };
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug!: string;

  @Prop({ type: Object })
  municipalConfig?: MunicipalConfig;
}

export type TenantDocument = Tenant & Document;

export const TenantSchema = SchemaFactory.createForClass(Tenant);
