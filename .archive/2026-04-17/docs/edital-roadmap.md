# Roadmap de Implementacao do Edital

Data base: 2026-02-17

## Diretriz
Implementar as lacunas do edital sobre a base atual do FlyDea, sem substituir os modulos CTM/PGV MVP ja funcionais.

## Ordem de Execucao
1. Compliance
2. Integracoes tributarias
3. Cartas de notificacao
4. Levantamentos e entregaveis
5. Mobile PWA
6. PoC 95%
7. Cloud deploy + observabilidade (entrega documental e base tecnica)

## Etapa 1 - Compliance
### Back-end
- Criar modulo `compliance` com escopo tenant/project:
  - empresa e documentos de registro
  - responsaveis tecnicos
  - ART/RRT
  - CAT
  - equipe tecnica
  - checklist de conformidade
  - trilha de auditoria

### Front-end
- Criar pagina `/app/compliance` com abas:
  - Empresa
  - Responsaveis
  - ART/RRT
  - CAT
  - Equipe
  - Checklist

## Etapa 2 - Integracoes Tributarias
### Back-end
- Criar modulo `tax-integration`:
  - conectores (`REST_JSON`, `CSV_UPLOAD`, `SFTP`)
  - mapeamento de campos
  - teste de conexao
  - execucao manual de sync
  - logs de execucao

### Front-end
- Criar pagina `/app/integracoes`:
  - lista e cadastro de conectores
  - mapeamento basico
  - botoes de testar e sincronizar
  - historico de logs

## Etapa 3 - Cartas de Notificacao
### Back-end
- Criar modulo `notifications-letters`:
  - templates versionados
  - preview
  - geracao em lote
  - PDF server-side
  - armazenamento no MinIO
  - protocolo e status

### Front-end
- Criar pagina `/app/cartas`:
  - templates
  - geracao em lote
  - historico e download

## Etapa 4 - Levantamentos e Entregaveis
### Back-end
- Criar modulo `surveys`:
  - tipos `AEROFOTO_RGB_5CM`, `MOBILE_LIDAR_360`
  - metadados tecnicos obrigatorios
  - upload presigned
  - registro de arquivos
  - checklist QA
  - publicacao GeoServer para GeoTIFF/COG
  - criacao de layer no catalogo

### Front-end
- Criar pagina `/app/levantamentos`:
  - lista e detalhe
  - arquivos e QA
  - acao de publicacao

## Etapa 5 - Mobile PWA
- Criar rota `/mobile`.
- Habilitar manifest + service worker.
- Implementar coleta CTM simples:
  - busca de parcela
  - checklist
  - foto (base64)
  - geolocalizacao
  - persistencia offline em IndexedDB
  - fila e sincronizacao quando online

## Etapa 6 - PoC 95%
### Artefatos
- `/poc/requirements-matrix.md`
- `/poc/demo-script.md`
- `/poc/seed/*`
- `/poc/checks/*`

### Back-end
- `GET /poc/health`
- `GET /poc/score`

### Front-end
- Pagina `/app/poc` com score e evidencias.

## Etapa 7 - Cloud + Observabilidade
- Criar `docs/cloud-deploy.md`.
- Criar IaC minima em `infra/iac` (skeleton Terraform ou Helm).
- Adicionar `/metrics` (Prometheus).
- Adicionar correlation-id em logs de request/resposta.

## Criterios de Pronto
- Endpoints multi-tenant e protegidos por RBAC.
- Telas principais acessiveis pelo menu app.
- Fluxos validaveis por check automatizado em `/poc/score`.
- Build e lint passando para `apps/api` e `apps/web`.
