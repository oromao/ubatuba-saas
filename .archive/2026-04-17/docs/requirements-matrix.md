# Requirements Matrix (Licitacao)

| ID | Requisito | Modulo/Tela/Fluxo | Perfil(s) | Tipo | Teste associado | Status | Observacao |
|---|---|---|---|---|---|---|---|
| R-001 | Aerolevantamento RGB 5cm (pipeline completo) | `/app/levantamentos`, upload/QA/publicar | ADMIN/GESTOR/OPERADOR | E2E | `poc/checks/run-full-qa-licitacao.mjs :: admin_surveys_full_pipeline` | PASSOU | Inclui presign, complete, QA e publish |
| R-002 | Mapeamento movel 360 + LiDAR | `/app/levantamentos` tipo `MOBILE_LIDAR_360` | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_surveys_full_pipeline` | PASSOU | Inclui arquivo `LAS_LAZ` |
| R-003 | Atualizacao cadastro imobiliario | CTM parcelas (CRUD, pendencias, histórico) | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_ctm_parcels_crud_and_details`, `admin_ctm_parcel_subrecords`, `admin_ctm_import_geojson` | PASSOU | Workflow e auditoria validados |
| R-004 | Atualizacao PGV | Zonas/faces/fatores/versões/cálculo | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_pgv_versions_and_valuations`, `admin_pgv_reports_and_impact` | PASSOU | Inclui impacto e trace |
| R-005 | Plataforma web + mobile | Navegação + `/mobile` + sync | ADMIN/GESTOR/OPERADOR/CAMPO/LEITOR* | E2E | `... :: admin_mobile_sync`, `ui_admin_mobile`, `ui_campo_mobile`, `poc/checks/roles-smoke.spec.js` | PASSOU | *LEITOR com bloqueio de escrita |
| R-006 | Hospedagem em nuvem / observabilidade | `/health`, `/metrics`, blueprint cloud | ADMIN | E2E + Manual | `... :: public_health_metrics_poc` + `docs/cloud-deploy.md` | MANUAL | Infra cloud real depende de ambiente externo |
| R-007 | Integracao com tributario municipal | `/app/integracoes`, conectores/sync/logs | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_tax_integration_full_pipeline`, `ui_admin_app-integracoes` | PASSOU | `SFTP` com status de stub técnico |
| R-008 | Cartas de notificacao | `/app/cartas`, template/preview/lote/download | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_notifications_letters_full_pipeline`, `ui_admin_app-cartas` | PASSOU | PDF + status/protocolo |
| R-009 | PoC >= 95% aderencia | `/app/poc`, `/poc/score` | Todos (consulta) | E2E | `... :: admin_poc_score`, `ui_admin_app-poc` | PASSOU | Score 100 no run final |
| R-010 | Registro Ministerio da Defesa | `/app/compliance` (company/checklist) | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_compliance_full_pipeline` | PASSOU | Evidências e trilha |
| R-011 | Registro CREA/CAU | `/app/compliance` (responsáveis) | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_compliance_full_pipeline` | PASSOU | CRUD responsável técnico |
| R-012 | CAT registrada | `/app/compliance` (CAT) | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_compliance_full_pipeline` | PASSOU | Cadastro e atualização |
| R-013 | Equipe tecnica especializada | `/app/compliance` (equipe) | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_compliance_full_pipeline` | PASSOU | Estrutura de equipe validada |
| R-014 | RBAC por perfil | Permissões API/UI por role | ADMIN/GESTOR/OPERADOR/CAMPO/LEITOR | E2E | `... :: gestor_permissions_matrix`, `operador_permissions_matrix`, `campo_permissions_matrix`, `leitor_permissions_matrix`, `poc/checks/roles-smoke.spec.js` | PASSOU | Includes forbidden 403 checks |
| R-015 | Navegação geral e menus principais | Sidebar/topbar/rotas principais | Todos | E2E | `... :: ui_*_app-*` + `roles-smoke.spec.js` | PASSOU | Cobertura por perfil |
| R-016 | Busca global por telas/modulos | Command palette (`Ctrl/Cmd+K`) | Todos | E2E | `poc/checks/roles-smoke.spec.js :: @smoke @roles admin...`, `... leitor...` | PASSOU | Leitor sem “Parcelas” na busca |
| R-017 | Operação de mapa (camadas/filtros) | `/app/maps` | ADMIN/GESTOR/OPERADOR/CAMPO/LEITOR | E2E | `... :: ui_*_app-maps` | PASSOU | Depende de ambiente com WebGL |
| R-018 | Desenho no mapa (criar/salvar/excluir) | `/app/maps` draw tools | ADMIN | E2E | `... :: ui_admin_map_draw_save_delete` | PASSOU | Validado sem erro de geometria |
| R-019 | Download/export de dados (CSV/GeoJSON/PDF) | PGV exports + cartas download | ADMIN/GESTOR/OPERADOR | E2E | `... :: admin_pgv_reports_and_impact`, `admin_notifications_letters_full_pipeline` | PASSOU | Estrutura mínima e status 2xx |
| R-020 | Requisito de nuvem (ambiente produtivo) | Terraform/ECS/operação real | ADMIN/DevOps | Manual | `docs/cloud-deploy.md`, `infra/iac/terraform/*` | NÃO COBERTO | Fora do escopo local de E2E |
| R-021 | Ambiguidade: escopo SFTP “completo” no edital | Integrações SFTP | ADMIN/GESTOR/OPERADOR | Ambíguo | `admin_tax_integration_full_pipeline` | MANUAL | Doc cita `SFTP` como stub técnico |
