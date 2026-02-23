# Matriz de Requisitos - PoC FlyDea (95%)

| Req | Requisito do edital | Feature implementada | Evidencia | Tela/API |
|---|---|---|---|---|
| 1 | Aerolevantamento RGB 5cm | Modulo `surveys` com metadados, upload, QA e publicacao GeoServer | `apps/api/src/modules/surveys/*` | `/app/levantamentos`, `POST /surveys`, `POST /surveys/:id/publish` |
| 2 | Mapeamento movel 360 + LiDAR | Registro de entregaveis `EQUIRETANGULAR_360` e `LAS_LAZ` | `survey.schema.ts` (categories) | `/app/levantamentos`, `POST /surveys/:id/files/complete` |
| 3 | Atualizacao cadastro imobiliario | Workflow CTM + pendencias + historico/auditoria | `parcel.schema.ts`, `parcel-audit.schema.ts` | `/app/ctm/parcelas`, `GET /ctm/parcels/pendencias`, `GET /ctm/parcels/:id/history` |
| 4 | Atualizacao PGV | Relatorio de impacto + trilha de calculo | `valuations.service.ts` | `GET /pgv/valuations/impact-report`, `GET /pgv/valuations/parcel/:id/trace` |
| 5 | Plataforma web + mobile | PWA `/mobile` com IndexedDB + fila offline | `apps/web/src/app/mobile/page.tsx` | `/mobile`, `POST /mobile/ctm-sync` |
| 6 | Hospedagem em nuvem | Blueprint AWS + IaC base Terraform + observabilidade | `docs/cloud-deploy.md`, `infra/iac/terraform/*` | `GET /metrics` |
| 7 | Integracao tributaria | Modulo adaptadores `REST_JSON`, `CSV_UPLOAD`, `SFTP` | `apps/api/src/modules/tax-integration/*` | `/app/integracoes`, `POST /tax-integration/*` |
| 8 | Cartas de notificacao | Templates versionados + lote + PDF + protocolo | `apps/api/src/modules/notifications-letters/*` | `/app/cartas`, `POST /notifications-letters/batches/generate` |
| 9 | PoC 95% aderencia | Endpoints `poc/health`, `poc/score` + scripts de checks | `apps/api/src/modules/poc/*`, `poc/checks/*` | `/app/poc`, `GET /poc/score` |
| 10 | Registro Ministerio da Defesa | Compliance com evidencias e validade documental | `compliance.schema.ts` | `/app/compliance` |
| 11 | Registro CREA/CAU | Cadastro de empresa e responsaveis tecnicos | `compliance.dto.ts` | `/app/compliance` |
| 12 | CAT registrada | Cadastro e vinculo de CAT com projeto/levantamento | `compliance.service.ts` | `/app/compliance` |
| 13 | Equipe tecnica especializada | Cadastro de equipe + atribuicoes + anexos | `compliance.schema.ts` | `/app/compliance` |

## Critério de aceitação PoC
- Score minimo: **95%** em `GET /poc/score`.
- Evidencias rastreaveis por tela, endpoint e arquivo.
