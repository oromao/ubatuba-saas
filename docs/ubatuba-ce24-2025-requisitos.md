# Requisitos MVP — Ubatuba CE 24/2025 (REURB-S)

Fonte: Edital nº 179/2025 e Anexo VI (Termo de Referência) no arquivo `Pref Ubatuba - CE 24.2025.pdf` (fora do repo).

## Escopo MVP (obrigatório)

### Fluxo ponta a ponta
1. Cadastro de Projeto REURB-S
2. Cadastro de famílias/beneficiários e unidades/imóveis
3. Upload e versionamento de documentos por projeto/unidade/família
4. Notificações (email) com registro de evidências
5. Exportações tabulares (CSV/XLSX/JSON) e Planilha Síntese
6. Pacote Cartório/CRF (ZIP com índice e anexos)
7. Auditoria e RBAC em todas as ações

### Entregáveis exigidos (MVP)
- Banco de dados tabulado (CSV/XLSX/JSON)
- Planilha síntese (XLSX)
- Pacote cartório/CRF (ZIP)
- Dossiê do projeto (documentos + checklist por etapa)

### Requisitos LGPD
- Registro rastreável de acessos a dados pessoais (quem, quando, finalidade).
- Dados em formato interoperável para reutilização pela Administração.

## Nice-to-have (não bloqueante)
- Integração SMS real (manter adapter stub se sem credenciais).
- Automação completa de envio em lote com templates avançados.

## Mapa de telas (RBAC)

**Dashboard REURB**
- Admin/Coordenador: visão geral + progresso + pendências
- Operador/Leitura: leitura e indicadores básicos

**Projeto REURB**
- Abas: Visão geral / Famílias / Unidades / Documentos / Notificações / Exportações

**Famílias**
- Admin/Coordenador/Operador: CRUD + importação CSV
- Leitura: consulta

**Unidades**
- Admin/Coordenador/Operador: CRUD + vínculo com famílias
- Leitura: consulta

**Documentos / Dossiê**
- Admin/Coordenador/Operador: upload e checklist
- Leitura: consulta

**Notificações**
- Admin/Coordenador: templates + envios
- Operador: envios manuais sob supervisão
- Leitura: consulta

**Exportações**
- Admin/Coordenador: exportações e pacote
- Operador: exportações simples (CSV/XLSX)
- Leitura: consulta

## Requisito → Entidade → Tela → API → Exportação

**Projeto REURB**
- Entidade: `reurb_projects`
- Tela: Projeto REURB
- API: `POST/GET/PATCH /reurb/projects`

**Famílias**
- Entidade: `reurb_families`
- Tela: Famílias
- API: `POST/GET/PATCH /reurb/families`, `POST /reurb/families/import.csv`
- Export: `POST /reurb/families/export.(csv|xlsx|json)`

**Unidades/Imóveis**
- Entidade: `reurb_units`
- Tela: Unidades
- API: `POST/GET/PATCH /reurb/units`

**Documentos**
- Entidade: `reurb_documents`
- Tela: Documentos/Dossiê
- API: `POST /reurb/documents/presign-upload`, `POST /reurb/documents/complete-upload`

**Notificações**
- Entidade: `reurb_notification_templates`, `reurb_notifications`
- Tela: Notificações
- API: `POST/GET /reurb/notifications/templates`, `POST /reurb/notifications/send`

**Exportações**
- Entidade: `reurb_deliverables`
- Tela: Exportações
- API: `POST /reurb/families/export.*`, `POST /reurb/planilha-sintese/generate`, `POST /reurb/cartorio/package`

**Auditoria**
- Entidade: `reurb_audit_logs`
- Tela: Auditoria
- API: `GET /reurb/audit`

## Evidencias de teste (Playwright)

### Fluxo ponta a ponta
- Cadastro de Projeto REURB-S: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`
- Famílias/beneficiários + unidades/imóveis: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`
- Documentos e versionamento: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`
- Notificações + evidências: `tests/e2e/fullscan/reurb-guia.spec.ts`
- Exportações (CSV/XLSX/JSON) + Planilha Sintese: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`
- Pacote Cartorio/CRF (ZIP): `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

### RBAC
- Admin/Gestor/Operador/Leitor (permissoes e bloqueios): `tests/e2e/fullscan/reurb-rbac.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

### Dossie e checklist por etapa
- Dossie com documentos obrigatorios (antes/depois): `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`

### Auditoria e LGPD
- Registro de acesso com finalidade (header `x-lgpd-purpose`): `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`
- Consulta aos logs de auditoria (acao `ACCESS_FAMILIES_LIST`): `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`

### Integracao HTTP simples
- Ping de integracao (admin/gestor permitido): `tests/e2e/fullscan/reurb-rbac.spec.ts`
