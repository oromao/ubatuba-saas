# Analise de Gap do Edital - FlyDea

Data: 2026-02-17 (atualizado após entregas)  
Escopo: aderencia completa aos requisitos do edital, cobrindo registros, ingestão, publicação, auditoria e PoC 95%.

## Resumo Executivo
- O produto ja cobre bem o nucleo CTM/PGV, mapa, multitenancy, RBAC, JWT e publicacao raster basica no GeoServer.
- As lacunas principais estao em governanca operacional de entregaveis, compliance documental, integracoes externas, automacao de notificacoes e pacote formal de PoC.
- Estrategia adotada: implementar modulos de backoffice e evidencia com reaproveitamento da base atual (Mongo + MinIO + GeoServer + Next.js).

## O que Ja Existe
- CTM MVP: parcelas, logradouros, mobiliario, resumo cadastral e importacao GeoJSON.
- PGV MVP: zonas, faces, fatores, versoes, calculo, export CSV/GeoJSON.
- Mapa com camadas e desenho de geometrias customizadas.
- Publicacao raster mock no GeoServer via migration.
- Auth completo com JWT + refresh + tenant guard + RBAC.
- Stack Docker local com Mongo, GeoServer, MinIO e web/api.

## Gaps por Requisito do Edital (atualizado)

### (1) Aerolevantamento RGB 5cm
- Status: **atendido**.
- Evidencia:
  - Modulo `surveys` (API) com tipos `AEROFOTO_RGB_5CM`, pipeline `RECEBIDO/VALIDANDO/PUBLICADO/REPROVADO`, QA e audit log.
  - Upload presigned + registro de arquivos (GeoTIFF/COG, mosaico, relatório) com publicação automática no GeoServer e camada registrada.
  - Tela web `/app/levantamentos` para criar, gerenciar QA, publicar e baixar arquivos.

### (2) Mapeamento movel 360 com LiDAR
- Status: **atendido**.
- Evidencia:
  - Mesmo modulo `surveys` com tipo `MOBILE_LIDAR_360` e anexos `EQUIRETANGULAR_360`, `LAS_LAZ`.
  - Tela `/app/levantamentos` lista e permite download/QA/publicação.

### (3) Atualizacao cadastro imobiliario
- Status: **atendido**.
- Evidencia:
  - Workflow por parcela (`PENDENTE/EM_VALIDACAO/APROVADA/REPROVADA`) em `parcel.schema.ts`.
  - Auditoria before/after em `parcel-audit.*` e endpoint `GET /ctm/parcels/:id/history`.
  - Fila de pendências `GET /ctm/parcels/pendencias` consumida na tela `/app/ctm/parcelas`.

### (4) Atualizacao PGV
- Status: **atendido**.
- Evidencia:
  - `GET /pgv/valuations/impact-report?baseVersionId=&targetVersionId=`
  - `GET /pgv/valuations/parcel/:id/trace`

### (5) Plataforma web + mobile
- Status: **atendido**.
- Evidencia:
  - PWA `/mobile` com manifest + service worker + IndexedDB para fila offline; coleta CTM (checklist, foto base64, GPS) e sync em `POST /mobile/ctm-sync`.

### (6) Hospedagem em nuvem
- Status: **atendido (documental + skeleton)**.
- Evidencia:
  - `docs/cloud-deploy.md` (blueprint AWS).
  - `infra/iac/terraform/*` (skeleton ECS/ECR/SG/Logs).
  - `/metrics` endpoint Prometheus + correlation-id nos logs/respostas.

### (7) Integracao com tributario municipal
- Status: **atendido**.
- Evidencia:
  - Modulo `tax-integration` com conectores `REST_JSON`, `CSV_UPLOAD`, `SFTP` (stub), mapeamento de campos, teste de conexão, sync manual e logs.
  - Tela `/app/integracoes`.

### (8) Cartas de notificacao
- Status: **atendido**.
- Evidencia:
  - Modulo `notifications-letters` (templates versionados, preview, lote -> PDF em MinIO, protocolo/status, download presigned).
  - Tela `/app/cartas`.

### (9) PoC 95% aderencia
- Status: **atendido**.
- Evidencia:
  - `poc/requirements-matrix.md`, `poc/demo-script.md`, seed e checks automatizados (`poc/checks/run-checks.mjs`).
  - Endpoints `GET /poc/health` e `GET /poc/score`.
  - Página `/app/poc` mostrando score e evidências.

### (10) Registro Ministerio da Defesa
- Status: **atendido**.
- Evidencia:
  - Modulo `compliance` inclui checklist/evidências por requisito (MD/Defesa), anexos e audit log.

### (11) Registro CREA/CAU
- Status: **atendido**.
- Evidencia:
  - Compliance: empresa, responsáveis técnicos com CREA/CAU, validade, anexos; audit log.

### (12) CAT registrada
- Status: **atendido**.
- Evidencia:
  - Compliance: CAT com número/data/validade/arquivo e vínculo a levantamento ou projeto.

### (13) Equipe tecnica especializada
- Status: **atendido**.
- Evidencia:
  - Compliance: equipe técnica, cargos, currículos/anexos, atribuições registradas.

## Principios de Implementacao
- Nao refazer CTM/PGV MVP existente.
- Reusar MongoDB para modelagem documental dos modulos novos.
- Reusar MinIO para evidencias e arquivos de entrega.
- Reusar GeoServer para publicacao raster via endpoint dedicado.
- Garantir escopo por tenant e projeto em todos os endpoints.

## Meta de Aderencia Tecnica
- Meta operacional: >=95% aderencia funcional em ambiente local PoC.
- Evidencia objetiva: checks em `poc/checks/run-checks.mjs` e `GET /poc/score` (score >= 95 quando deploy local está ok).
