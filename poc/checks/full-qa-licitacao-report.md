# Relatorio QA Completo - Licitacao

- Data: 2026-02-20T19:04:44.720Z
- Run ID: 20260220190332
- API: http://localhost:4000
- WEB: http://localhost:3000
- Score tecnico (checks): 100% (105/105)
- Aderencia licitacao: 100% (13/13)

## Requisitos da licitacao

| Req | Status | Requisito | Evidencias | 
|---|---|---|---|
| 1 | OK | Aerolevantamento RGB 5cm | OK \`admin_surveys_full_pipeline\`<br>OK \`ui_admin_app-levantamentos\` |
| 2 | OK | Mapeamento movel 360 + LiDAR | OK \`admin_surveys_full_pipeline\` |
| 3 | OK | Atualizacao cadastro imobiliario | OK \`admin_ctm_parcels_crud_and_details\`<br>OK \`admin_ctm_parcel_subrecords\`<br>OK \`admin_ctm_import_geojson\` |
| 4 | OK | Atualizacao PGV | OK \`admin_pgv_versions_and_valuations\`<br>OK \`admin_pgv_reports_and_impact\` |
| 5 | OK | Plataforma web + mobile | OK \`admin_mobile_sync\`<br>OK \`ui_admin_mobile\`<br>OK \`ui_campo_mobile\` |
| 6 | OK | Hospedagem em nuvem/observabilidade | OK \`public_health_metrics_poc\` |
| 7 | OK | Integracao tributaria | OK \`admin_tax_integration_full_pipeline\`<br>OK \`ui_admin_app-integracoes\` |
| 8 | OK | Cartas de notificacao | OK \`admin_notifications_letters_full_pipeline\`<br>OK \`ui_admin_app-cartas\` |
| 9 | OK | PoC 95% aderencia | OK \`admin_poc_score\`<br>OK \`ui_admin_app-poc\` |
| 10 | OK | Registro Ministerio da Defesa | OK \`admin_compliance_full_pipeline\` |
| 11 | OK | Registro CREA/CAU | OK \`admin_compliance_full_pipeline\` |
| 12 | OK | CAT registrada | OK \`admin_compliance_full_pipeline\` |
| 13 | OK | Equipe tecnica especializada | OK \`admin_compliance_full_pipeline\` |

## Falhas encontradas

- Nenhuma falha nos checks executados.

## Evidencias

- JSON completo: \`/Users/paulo/sass/poc/checks/full-qa-licitacao-report.json\`
- Screenshots: \`/Users/paulo/sass/poc/checks/full-qa-screens\`
