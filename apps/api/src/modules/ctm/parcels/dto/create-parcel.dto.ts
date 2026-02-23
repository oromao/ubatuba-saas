import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { PolygonGeometry } from '../../../../common/utils/geo';

type EnderecoPrincipalDto = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
};

export class CreateParcelDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  sqlu!: string;

  @IsString()
  @IsOptional()
  inscription?: string;

  @IsString()
  @IsOptional()
  mainAddress?: string;

  @IsString()
  @IsOptional()
  inscricaoImobiliaria?: string;

  @IsObject()
  @IsOptional()
  enderecoPrincipal?: EnderecoPrincipalDto;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  statusCadastral?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';

  @IsString()
  @IsOptional()
  logradouroId?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  faceId?: string;

  @IsObject()
  geometry!: PolygonGeometry;
}
