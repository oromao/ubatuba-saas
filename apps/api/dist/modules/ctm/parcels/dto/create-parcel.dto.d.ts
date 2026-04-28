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
export declare class CreateParcelDto {
    projectId?: string;
    sqlu: string;
    inscription?: string;
    mainAddress?: string;
    inscricaoImobiliaria?: string;
    enderecoPrincipal?: EnderecoPrincipalDto;
    status?: string;
    statusCadastral?: string;
    observacoes?: string;
    workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';
    logradouroId?: string;
    zoneId?: string;
    faceId?: string;
    geometry: PolygonGeometry;
}
export {};
