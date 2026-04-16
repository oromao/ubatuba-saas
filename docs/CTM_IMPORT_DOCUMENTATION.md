# Documentação Operacional - Módulo CTM / Parcelas

## 1. Visão Geral

Este documento descreve as alterações realizadas no módulo de Cadastro Técnico Multifinalitário (CTM) para suportar importação de dados geoespaciais reais da prefeitura, separação entre dados DEMO e OFICIAL, e enriquecimento tributário via IPTU.

## 2. O que era DEMO

O sistema anterior utilizava um seed automático (`infra/seeds/ubatuba-parcels.js`) que criava lotes em posições aleatórias próximas a localizações reais de Ubatuba, mas sem corresponder à malha real do município. Esses dados eram marcados como `sourceType: 'DEMO'` por padrão e não havia distinção clara no frontend.

## 3. O que foi corrigido

### 3.1 Schema de Parcelas
- Adicionados campos: `sourceType`, `isOfficial`, `importBatchId`, `zoneamento`, `areaConstruida`, `areaCartografica`, `valorVenalTerreno`, `valorVenalConstrucao`, `valorVenalTotal`, `iptuLancado`, `iptuPago`, `iptuEmAberto`, `statusIPTU`, `exercicioIPTU`, `validationStatus`, `validationErrors`, `centroid`, `bbox`, `codigoImovel`, `setor`, `quadra`, `lote`, `cep`, `proprietarioNome`, `proprietarioDocumento`.
- Criados índices para `sourceType`, `isOfficial`, `importBatchId`, `statusIPTU`, `zoneamento`.

### 3.2 Importação GeoJSON
- Novo endpoint `POST /ctm/parcels/import` que aceita `FeatureCollection`.
- Suporte a aliases de propriedades (sqlu, SQLU, codigo_sql, etc.).
- Cálculo automático de `areaCartografica`, `centroid`, `bbox`.
- Validação de geometria (Polygon/MultiPolygon).
- Suporte a upsert por SQLU/inscrição existente.
- Geração de relatório de importação com erros por feature.
- Campo `sourceType` define a origem: `DEMO`, `GEOJSON`, `SHAPEFILE`, `OFFICIAL_IMPORT`.

### 3.3 Importação de IPTU/Enriquecimento
- Novo endpoint `POST /ctm/parcels/import-enrichment` para CSV de IPTU.
- Localiza parcela por SQLU ou inscrição imobiliária.
- Atualiza apenas campos tributários (não cria geometry placeholder).
- Gera resumo: processados, atualizados, não encontrados, erros.

### 3.4 Separação DEMO vs OFICIAL
- Frontend exibe aviso "Modo Demonstração" quando só há dados DEMO.
- Frontend exibe "Dados Oficiais" quando há parcelas importadas.
- Filtros para exibir apenas dados oficiais ou por tipo de origem.
- Badges visuais indicando origem de cada parcela.

### 3.5 Estatísticas e Painel
- Novo endpoint `GET /ctm/parcels/statistics` com:
  - Total de parcelas
  - Parcelas oficiais vs demo
  - Parcelas com SQLU
  - Valor venal total
  - IPTU lançado/pago/em aberto
  - Taxa de adimplência
  - Distribuição por zoneamento e status IPTU

## 4. Como importar GeoJSON oficial

### 4.1 Estrutura esperada do arquivo

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-45.0742, -23.4338],
          [-45.0742, -23.4355],
          [-45.0720, -23.4355],
          [-45.0720, -23.4338],
          [-45.0742, -23.4338]
        ]]
      },
      "properties": {
        "sqlu": "001-001-001-001",
        "inscricaoImobiliaria": "354400010001",
        "endereco": "Rua da Conceição",
        "numero": "100",
        "bairro": "Centro",
        "cep": "11680-000",
        "zoneamento": "RESIDENCIAL",
        "areaTerreno": 250,
        "areaConstruida": 180,
        "valorVenalTerreno": 125000,
        "valorVenalConstrucao": 90000,
        "valorVenalTotal": 215000
      }
    }
  ]
}
```

### 4.2 Aliases de campos suportados

O sistema reconhece múltiplos nomes de campos:
- SQLU: `sqlu`, `SQLU`, `sql_u`, `codigo_sql`, `lote_codigo`
- Inscrição: `inscricaoImobiliaria`, `inscricao`, `inscricao_imob`, `codigo_inscricao`
- Endereço: `endereco`, `logradouro`, `rua`, `nome_logradouro`
- Área terreno: `areaTerreno`, `area_terreno`, `area_m2`, `area`
- Zoneamento: `zoneamento`, `zona`, `zona_uso`, `zone`

### 4.3 Exemplo de requisição

```bash
curl -X POST "http://localhost:3000/api/ctm/parcels/import?projectId=..." \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "OFFICIAL_IMPORT",
    "fileName": "cadastro_oficial.geojson",
    "upsert": true,
    "data": { ... }
  }'
```

## 5. Como importar CSV de IPTU

### 5.1 Estrutura esperada

```csv
sqlu,inscricao,areaTerreno,valorVenalTotal,iptuLancado,iptuPago,iptuEmAberto,statusIPTU,exercicioIPTU
001-001-001-001,354400010001,250,215000,1500,1500,0,QUITADO,2025
001-001-002-001,354400010002,300,280000,2000,0,2000,INADIMPLENTE,2025
```

### 5.2 Mapeamento de colunas

O sistema tenta mapear colunas automaticamente. Você pode especificar mapeamento manual:

```json
{
  "sourceType": "CSV_ENRICHMENT",
  "fileName": "iptu_2025.csv",
  "columnMapping": {
    "sqlu": "codigo_lote",
    "inscricao": "inscricao_imob",
    "iptuLancado": "valor_lancado"
  },
  "csv": "..."
}
```

### 5.3 Exemplo de requisição

```bash
curl -X POST "http://localhost:3000/api/ctm/parcels/import-enrichment?projectId=..." \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "CSV_ENRICHMENT",
    "fileName": "iptu_2025.csv",
    "csv": "sqlu,inscricao,areaTerreno,valorVenalTotal,..."
  }'
```

## 6. Campos esperados nos arquivos oficiais

### 6.1 GeoJSON do cadastro territorial
- `sqlu` (obrigatório para vinculação)
- `inscricaoImobiliaria` (obrigatório para vinculação)
- `endereco` / `logradouro`
- `numero`
- `bairro`
- `cep`
- `zoneamento`
- `areaTerreno`
- `areaConstruida`
- `valorVenalTerreno`
- `valorVenalConstrucao`
- `valorVenalTotal`
- `codigoImovel`, `setor`, `quadra`, `lote`

### 6.2 CSV do IPTU
- `sqlu` ou `inscricao` (chave para vinculação)
- `areaTerreno`
- `areaConstruida`
- `valorVenalTerreno`
- `valorVenalConstrucao`
- `valorVenalTotal`
- `iptuLancado`
- `iptuPago`
- `iptuEmAberto`
- `statusIPTU` (QUITADO, PARCELADO, INADIMPLENTE, ISENTO, EXIGIVEL, NAO_CADASTRADO)
- `exercicioIPTU`

## 7. Limitações atuais

- O sistema não faz reprojeção de SRID automaticamente. O GeoJSON deve estar em WGS84 (SRID 4326) ou o arquivo deve conter informação de SRID para conversão futura.
- Shapefile ainda não é suportado nativamente (requer conversão para GeoJSON antes do upload).
- XLSX requer conversão para CSV ou uso de ferramenta externa.
- O volume alto de parcelas pode impactar performance (estratégias como MVT, paginação espacial não implementadas nesta versão).

## 8. Pendências que dependem da prefeitura

Para operação real, a prefeitura de Ubatuba deve fornecer:

1. **Shapefile ou GeoJSON do cadastro imobiliário** com as geometrias reais dos lotes e atributos (SQLU, inscrição, endereço, zoneamento, área, etc).

2. **Planilha IPTU** (CSV/XLSX) com dados tributários anuais (IPTU lançado, pago, saldo, status, exercício).

3. **Definição de SRID** usado na base cartográfica original (para eventual reprojeção).

4. **Dicionário de campos** caso os nomes das colunas não sigam os aliases reconhecidos pelo sistema.

Sem esses dados externos, o sistema只能 operar em modo DEMO para testes e apresentação.

## 9. Arquivos alterados

### Backend
- `apps/api/src/modules/ctm/parcels/parcel.schema.ts` - Schema atualizado com campos de origem, IPTU, validação
- `apps/api/src/modules/ctm/parcels/parcels.repository.ts` - Novos métodos `findBySqlu`, `findByInscription`, filtros
- `apps/api/src/modules/ctm/parcels/parcels.service.ts` - `importGeojson` melhorado, `importFromCsvEnrichment`, `getStatistics`
- `apps/api/src/modules/ctm/parcels/parcels.controller.ts` - Novos endpoints `statistics`, `import-enrichment`
- `apps/api/src/modules/ctm/parcels/import-batch.schema.ts` - Schema para rastreabilidade de imports
- `apps/api/src/modules/ctm/parcels/import-batch.repository.ts` - Repository para batches
- `apps/api/src/modules/ctm/parcels/dto/import-parcel.dto.ts` - DTOs para importação
- `apps/api/src/modules/ctm/ctm.module.ts` - Registro de novos providers

### Frontend
- `apps/web/src/app/app/ctm/parcelas/page.tsx` - Avisos DEMO, filtros, badges, estatísticas

### Testes
- `apps/api/test/parcels-import.spec.ts` - Testes de importação e estatísticas

## 10. Checklist para receber dado oficial

- [ ] Shapefile/GeoJSON do cadastro territorial recebido
- [ ] Planilha IPTU atualizada recebida
- [ ] SRID da base cartográfica identificado (se não for WGS84)
- [ ] Verificar nomes das colunas vs aliases suportados
- [ ] Testar import em ambiente de desenvolvimento
- [ ] Validar geometrias e áreas após import
- [ ] Verificar vinculação SQLU/inscrição
- [ ] Gerar relatório de importação
- [ ] Configurar usuário operador de importação no sistema
