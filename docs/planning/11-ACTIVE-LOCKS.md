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
| 2026-05-27 | T13-SPRINT2-INIT | Antigravity | DONE | — | Assinatura Gov.br e Auditoria Pública por QR Code / Selo de Segurança |
| 2026-05-27 | T12-SPRINT1-INIT | Antigravity | DONE | — | SFTP/CSV Conector Tributário e Painel de Conectores Premium |
| 2026-05-26 | QA-100 | Antigravity | DONE | — | Adicionados testes unitários para 5 módulos backend críticos (assets, areas, projects, compliance, surveys) |
| 2026-05-14 | T-MATURITY-BOOST-F0 | OpenCode | DONE | — | FASE 0: MongoDB port fix + backup script + SSL setup + CI/CD + nginx prod |

| Data | Task ID | Agente | Resultado | Commit | Observação |
|---|---|---|---|---|---|
| 2026-05-13 | T10-DASHBOARD-GRAPHS | OpenCode | DONE | — | recharts + 5 chart components. TSC clean |
| 2026-05-13 | T-HARNESS-BUS-QUEUES | OpenCode | DONE | — | Bus+queues+planning bridge+17 tests. Harness REAL 5/5 |

| Data | Task ID | Agente | Resultado | Commit | Observação |
|---|---|---|---|---|---|
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
