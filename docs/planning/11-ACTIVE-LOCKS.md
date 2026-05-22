# 11 — Active Locks

> Controle de tarefas em execução por agentes de IA.
> Antes de iniciar qualquer tarefa, o agente deve criar um lock aqui.
> Ao finalizar, o agente deve marcar DONE/PARTIAL/BLOCKED e liberar ou encerrar o lock.
> Nunca duas IAs devem trabalhar na mesma task ou nos mesmos arquivos sem coordenação explícita.

## Estados de lock

- **CLAIMED** — tarefa reservada, ainda sem edição relevante
- **IN_PROGRESS** — tarefa em execução
- **VALIDATING** — código/docs alterados, rodando provas
- **DONE** — concluído e registrado
- **PARTIAL** — parcialmente concluído, precisa continuação
- **BLOCKED** — bloqueado por motivo real
- **STALE** — lock antigo (> 4h sem atualização), precisa revisão
- **RELEASED** — lock liberado sem conclusão

## Regras

1.  **Lock First:** Antes de iniciar qualquer trabalho, criar uma entrada na tabela de "Locks ativos".
2.  **No Overlap:** Se a task já tiver lock `CLAIMED`, `IN_PROGRESS` ou `VALIDATING`, escolha outra.
3.  **File Blocking:** Se você pretende editar arquivos que já estão listados em outro lock ativo, NÃO inicie a tarefa. Escolha uma tarefa que toque arquivos independentes.
4.  **Single Writer:** Um agente físico/processo só pode ter 1 task ativa como Writer por vez.
5.  **Parallelism:** Tasks podem rodar em paralelo se e somente se os arquivos/módulos afetados forem independentes (ex: Módulo A vs Módulo B, ou Documentação vs Teste isolado).
6.  **Stale Locks:** Locks sem atualização por mais de 4 horas devem ser marcados como `STALE` e podem ser retomados/limpos após verificação.
7.  **Handoff:** Ao finalizar, mova a linha para o "Histórico de locks encerrados".
8.  **Atomic Planning:** Ao atualizar este arquivo, tente ser o mais rápido possível para evitar colisões no próprio arquivo de locks.

## Locks ativos

| Task ID | Agente | Status | Arquivos bloqueados | Início | Última atualização | Branch | Prova esperada | Observação |
|---|---|---|---|---|---|---|---|---|


## Histórico de locks encerrados

| Data | Task ID | Agente | Resultado | Commit | Observação |
|---|---|---|---|---|---|
| 2026-05-22 | QA-004-BBOX-FIX | Antigravity | DONE | 5277e0b | Blindagem de 4 services contra CastError + 6 testes de borda. 16/16 parcelas passing. |

| 2026-05-22 | QA-005 | Antigravity | DONE | [QA-005] 8+ modulos sem dados na demo populados com sucesso | Populados dados consistentes de demo em 18 colecoes, preenchendo todos os empty states do frontend de forma realista e geograficamente consistente. |
| 2026-05-22 | QA-002 | Antigravity | DONE | [QA-002] CTM integration tests stabilized & seeds populated | Corrigidocertificates.service mock, JwtService sub hex hex valid, ProjectsService inject dynamic na parcel seed. Vistorias e parcelas 100% testadas e verdes. |
| 2026-05-22 | QA-001 | Antigravity | DONE | [QA-001] Corrigido retorno resiliente de KPIs do Dashboard sob estresse e TS2532 | Tratamento de erros concorrentes e cache robusto implementados no backend NestJS com 3 novos testes unitários passando. |
| 2026-05-22 | T10-DASHBOARD-GRAPHS | Antigravity | DONE | [T10-DASHBOARD-GRAPHS] Gráficos interativos animados e responsivos integrados | Componentes Donut e Barras Horizontais desenvolvidos e build frontend validado sem erros. |
| 2026-05-22 | T10-DENGUE-PDF | Antigravity | DONE | [T10-DENGUE-PDF] Módulo Combate à Dengue no PDF institucional v1 (Cópia) | docs/flydea-govtech-overview-dengue.pdf gerado com sucesso contendo 16 páginas |
| 2026-05-21 | T10-PDF-V2-REWRITE | Antigravity | DONE | [T10-PDF-V2-REWRITE] Reescrita completa do PDF comercial v2.0 com 14 melhorias estruturais | docs/flydea-govtech-overview-v2.pdf (4.6MB, 18 págs, novo script generate-pdf-v2.mjs) |
| 2026-05-21 | T10-PDF-REFORMAT-FINE-TUNING | Antigravity | DONE | [T10-PDF-REFORMAT-FINE-TUNING] Fine-tuning do PDF: espaçamento, WebGIS prints, Base64, asteriscos | docs/flydea-govtech-overview.pdf compilado com capturas perfeitas de produção |
| 2026-05-21 | T10-PDF-REFORMAT | Antigravity | DONE | [T10-PDF-REFORMAT] Reorganização do PDF comercial, correção da capa e renderização de imagens Base64 | docs/flydea-govtech-overview.pdf compilado com sucesso e imagens Base64 |
| 2026-05-21 | T10-OVERVIEW-PDF-PROD | Antigravity | DONE | [T10-OVERVIEW-PDF-PROD] Screenshots of production (São Paulo) compiled into official PDF | docs/flydea-govtech-overview.pdf compiled from active production labspaulo.site |
| 2026-05-21 | T9-OVERVIEW-PDF | Antigravity | DONE | [T9-OVERVIEW-PDF] Overview PDF digital compiled | docs/flydea-govtech-overview.pdf compiled with success |
| 2026-04-30 | T8-CERT-SIGN | OpenCode | DONE | [T8-CERT-SIGN] RSA digital signature + 9 tests | DigitalSignatureService + schema updates |
| 2026-04-30 | T8-MUNICIPAL-CFG | OpenCode | DONE | [T8-MUNICIPAL-CFG] Tenant municipalConfig + 11 tests | Schema + service + controller + IPTU fallback |
| 2026-04-30 | T8-PROCESS-ALVARA | OpenCode | PARTIAL | [T8-PROCESS-ALVARA] parcelId + certidão auto + 13 tests | Alvara linkage + tests done; pending: sign, full PDF |
| 2026-04-30 | T8-CTM-COMPLETO | OpenCode | DONE | [T8-CTM-COMPLETO] Subdivision workflow + 11 tests | Schema + Service + Controller |
| 2026-04-30 | T8-TRIB-IPTU | OpenCode | DONE | [T8-TRIB-IPTU] IPTU engine + 8 unit tests | IptuService + IptuController + aliquotaIptu |
| 2026-04-30 | T8-GIS-MVT | OpenCode | DONE | [T8-GIS-MVT] MVT tile generation + 7 unit tests | 43/43 tests passing |
| 2026-04-30 | T0-STATUS-RECONCILE | OpenCode | DONE | - | 3 backlog fixes + GIS verification |
| 2026-04-29 | T5-SP-UNIT | Kimi/OpenCode | DONE | [T5-SP-UNIT] Unit tests for GisService | 36 tests, 84% stmt coverage |
| 2026-04-29 | T0-MULTIAGENT-LOCKS | Gemini CLI | DONE | - | Coordination protocol implemented |
| 2026-04-29 | T0-PLANNING-SUPREME | Gemini CLI | DONE | ac0e6d1 | Supreme planning organization |
