# Documentação - Importação de Base Externa de São Paulo (GeoSampa)

## 1. Visão Geral

Este documento descreve como importar uma base de dados geoespaciais externa (como a camada de lotes do GeoSampa de São Paulo) para uso demonstrativo no sistema FlyDea/Ubatuba.

**IMPORTANTE**: Esta base é tratada como **dados de demonstração externos**, não como dados oficiais de Ubatuba. O sistema marca claramente essa origem para evitar confusão.

## 2. Diferenças entre tipos de base

| Tipo | sourceType | isOfficial | municipalityName | Uso |
|------|------------|------------|------------------|-----|
| Demo interno | DEMO | false | Ubatuba | Seed automático apenas para dev |
| **Base externa** | DEMO_EXTERNAL | false | São Paulo (ou outro) | **GeoJSON importado de outro município** |
| Amostra oficial | OFFICIAL_SAMPLE | false | São Paulo | Amostra de dados oficiais de outro município |
| Ubatuba oficial | OFFICIAL_IMPORT | true | Ubatuba | Dados reais da prefeitura de Ubatuba |

## 3. Como importar GeoJSON de São Paulo

### 3.1 Estrutura esperada do arquivo

O GeoJSON deve conter features com geometrias Polygon/MultiPolygon e properties com os dados cadastrais:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "lote_001",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-46.6, -23.5],
          [-46.6, -23.55],
          [-46.65, -23.55],
          [-46.65, -23.5],
          [-46.6, -23.5]
        ]]
      },
      "properties": {
        "sql": "0010103001",
        "inscricao": "1003001000",
        "logradouro": "Rua Example",
        "numero": "100",
        "bairro": "Vila Example",
        "cep": "01234-567",
        "setor": "001",
        "quadra": "010",
        "lote": "003",
        "area": 250,
        "area_construida": 180,
        "valor_venal": 150000
      }
    }
  ]
}
```

### 3.2 Campos suportados (aliases)

O sistema detecta automaticamente diversos nomes de campos:

- **SQL/SQLU**: `sqlu`, `sql_u`, `sql`, `sql_code`, `cod_sql`, `codigo_sql`, `lote_codigo`
- **Inscrição**: `inscricao`, `inscricao_imob`, `cadastro`, `cod_cad`, `codigo_inscricao`
- **Setor**: `setor`, `cd_setor`, `setor_cod`, `num_setor`
- **Quadra**: `quadra`, `cd_quadra`, `quadra_cod`, `num_quadra`
- **Lote**: `lote`, `cd_lote`, `lote_cod`, `num_lote`
- **Endereço**: `endereco`, `logradouro`, `rua`, `nome_logradouro`, `nome_logr`
- **Número**: `numero`, `num`, `nr`, `num_end`
- **Bairro**: `bairro`, `bairro_nome`, `nome_bairro`, `distrito`
- **CEP**: `cep`, `cep_endereco`
- **Área**: `area`, `area_terreno`, `area_m2`, `area_lote`
- **Área construída**: `area_construida`, `area_const`, `area_edificada`
- **Valor venal**: `valor_venal`, `valor_venal_total`, `valor_total`

### 3.3 Requisição de importação

```bash
curl -X POST "http://localhost:3000/api/ctm/parcels/import?projectId=..." \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "DEMO_EXTERNAL",
    "fileName": "geosampa_lotes_centro.geojson",
    "municipalityName": "São Paulo",
    "municipalityCode": "3550308",
    "upsert": false,
    "data": {
      "type": "FeatureCollection",
      "features": [...]
    }
  }'
```

### 3.4 Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| sourceType | string | Não | Tipo de origem. Use `DEMO_EXTERNAL` ou `OFFICIAL_SAMPLE` |
| fileName | string | Não | Nome do arquivo importado |
| municipalityName | string | Condicional | Nome do município de origem (ex: "São Paulo") |
| municipalityCode | string | Não | Código IBGE do município |
| upsert | boolean | Não | Se true, atualiza lotes existentes com mesma SQLU |
| data | object | Sim | FeatureCollection GeoJSON |

## 4. Comportamento do sistema

### 4.1 Ao importar com DEMO_EXTERNAL

- `sourceType` = DEMO_EXTERNAL
- `isOfficial` = false
- `municipalityName` = valor fornecido (ou "São Paulo" como default)
- `enderecoPrincipal.cidade` = municipalityName
- Geometria importada com centroid e bbox calculados
- Área calculada automaticamente se não informada

### 4.2 Frontend

O sistema exibe:
- Badge "BASE DEMO - SÃO PAULO" quando há base externa
- Alerta explicativo sobre base demonstrativa externa
- Filtros para exibir apenas dados externos
- Busca funciona normalmente por SQLU/endereço

### 4.3 Busca por setor-quadra-lote

Campos separados são populados automaticamente:
- `setor`: código do setor
- `quadra`: código da quadra
- `lote`: código do lote

A busca no repositório também funciona por esses campos.

## 5. Exemplos de arquivos

### 5.1 GeoJSON mínimo válido

```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[-46.6, -23.5], [-46.6, -23.55], [-46.65, -23.55], [-46.65, -23.5], [-46.6, -23.5]]]
    },
    "properties": {
      "sql": "0010103001",
      "inscricao": "1003001000"
    }
  }]
}
```

### 5.2 GeoJSON completo com atributos

```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[-46.633, -23.550], [-46.633, -23.555], [-46.638, -23.555], [-46.638, -23.550], [-46.633, -23.550]]]
    },
    "properties": {
      "sql": "001001001001",
      "inscricao": "100010010001",
      "logradouro": "Avenida Paulista",
      "numero": "1000",
      "bairro": "Bela Vista",
      "cep": "01310-100",
      "setor": "001",
      "quadra": "001",
      "lote": "001",
      "area": 850,
      "area_construida": 2500,
      "valor_venal": 4500000
    }
  }]
}
```

## 6. Limitações conhecidas

- O sistema não faz reprojeção de SRID. O GeoJSON deve estar em WGS84 (EPSG:4326).
- Para arquivos muito grandes (10k+ features), considere dividir em chunks.
- Shapefile não é suportado diretamente; converta para GeoJSON antes.

## 7. Por que não é dado oficial de Ubatuba

1. **sourceType diferente**: Usa `DEMO_EXTERNAL` ou `OFFICIAL_SAMPLE`, nunca `OFFICIAL_IMPORT`
2. **isOfficial = false**: Explicitamente marcado como não oficial
3. **municipalityName**: Indica origem de outro município
4. **Frontend**: Badge e alerta informam tratar-se de base demonstrativa
5. **Validação**: Pendências são ignoradas para bases externas (validação mais flexível)

## 8. Checklist para importação

- [ ] GeoJSON em formato correto (FeatureCollection)
- [ ] Geometrias válidas (Polygon ou MultiPolygon)
- [ ] Cada feature tem SQL ou inscrição para vinculação
- [ ] Parâmetro municipalityName definido
- [ ] Testar com poucos registros primeiro
- [ ] Verificar se polígonos aparecem no mapa
- [ ] Verificar badges e alertas no frontend

## 9. Arquivos alterados

- `apps/api/src/modules/ctm/parcels/parcel.schema.ts` - Adicionados `municipalityName`, `municipalityCode`, novos `sourceType`
- `apps/api/src/modules/ctm/parcels/parcels.service.ts` - Suporte a `municipalityName` na importação, aliases expandidos
- `apps/api/src/modules/ctm/parcels/parcels.controller.ts` - Novos parâmetros no endpoint de importação
- `apps/web/src/app/app/ctm/parcelas/page.tsx` - Badges e alertas para base externa
- `apps/api/test/parcels-external-demo.spec.ts` - Testes unitários para importação externa
