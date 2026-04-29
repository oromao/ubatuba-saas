# Planning Directory

Esta pasta contém o núcleo vivo do projeto FlyDea. Não é uma pasta de documentação morta; é o sistema de execução utilizado por todos os agentes de Inteligência Artificial.

## 1. O que é a pasta planning
É o sistema centralizado de decisão e rastreamento de progresso para a arquitetura multi-agente do FlyDea. Aqui definimos o que o produto é, o que falta construir, e o que acabou de ser entregue.

## 2. Qual arquivo ler primeiro
O ponto de entrada de todo agente é a raiz do repositório: `AGENTS.md`. Depois, leia o `00-PROJECT-CONTEXT.md` e o `04-PROGRESS-SUMMARY.md` para se contextualizar.

## 3. Quais arquivos são vivos
Os seguintes arquivos são atualizados constantemente durante o desenvolvimento:
- `01-MATURITY-MATRIX.md`: Evolui conforme provas robustas (P1-P8) são adicionadas.
- `02-BACKLOG.md`: O catálogo de trabalho.
- `03-EXECUTION-PLAN.md`: A fila de tarefas reais (o que fazer agora).
- `04-PROGRESS-LOG.md`: Histórico (append-only).
- `04-PROGRESS-SUMMARY.md`: Snapshot rápido do estado do projeto.
- `05-CLEANUP-INVENTORY.md`: Registro contínuo de lixo e arquivos arquivados.

## 4. Quais arquivos são reference
A pasta `reference/` contém arquivos estáticos como sumários executivos, auditorias passadas, guias de concorrência e estratégias de editais que servem de contexto, mas não geram tarefas ativas ou necessitam de atualização frequente.

## 5. Como atualizar o backlog (`02-BACKLOG.md`)
Atualize os status das tarefas para `TODO`, `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `DONE` ou `MERGED`. Lembre-se: `DONE` exige prova no filesystem ou teste que passe!

## 6. Como atualizar o progress log (`04-PROGRESS-LOG.md`)
Adicione SEMPRE no topo, sem editar ou deletar as entradas antigas. Siga o formato `### YYYY-MM-DD — <Agente> — <Item/s>` que está no topo do arquivo.

## 7. Como atualizar a maturity matrix (`01-MATURITY-MATRIX.md`)
Altere o score bruto ou score ponderado apenas quando uma evidência real (testes de stress E2E, dados em escala) corroborar a mudança de tier para o domínio afetado. Reporte qualquer rebaixamento necessário devido a falha ou ausência de prova `Municipal-Grade`.

## 8. Como atualizar o execution plan (`03-EXECUTION-PLAN.md`)
Puxe tarefas do backlog para "Próximos 5 Itens Obrigatórios" à medida que as anteriores forem sendo completadas. O plano de execução não é catálogo, é fila restrita e prioritária.

## 9. Como outro agente deve continuar
Qualquer IA pode retomar o trabalho de onde a anterior parou:
- Lendo os arquivos `00`, `04-SUMMARY`, `07`, e depois o `03-EXECUTION-PLAN.md`.
- Pegando o primeiro item do execution plan.
- Consulte `08-AGENT-HANDOFF.md` para instruções de "handoff".

## 10. Diferença entre execução, referência e arquivo
- **Execução** (raiz de `docs/planning`): Documentos mutáveis guiando a IA no trabalho do sprint atual.
- **Referência** (`docs/planning/reference/`): Relatórios, gap analysis e materiais estáticos do produto.
- **Arquivo** (`.archive/` na raiz do repo): Código apagado, módulos substituídos, scripts antigos e logs (mantidos de forma segura caso sejam úteis no futuro).