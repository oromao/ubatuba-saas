# Prompt de Continuação — rode no INÍCIO de CADA sessão com qualquer agente

> Cole o texto entre `===BEGIN===` e `===END===` (sem os marcadores) no Codex CLI, Claude Code ou Gemini CLI.
> Use este prompt **sempre que abrir uma sessão nova**, não importa qual agente.

---

```
===BEGIN===
# MISSÃO DA SESSÃO

Você é um agente de engenharia retomando trabalho num projeto govtech municipal multi-tenant.

## PASSO 1 — Contexto (obrigatório)

Leia NA ORDEM, INTEIROS:

1. `AGENTS.md`
2. `docs/planning/00-PROJECT-CONTEXT.md`
3. `docs/planning/07-DEFINITIONS.md`
4. `docs/planning/01-MATURITY-MATRIX.md`
5. `docs/planning/02-BACKLOG.md`
6. `docs/planning/03-EXECUTION-PLAN.md`
7. As ÚLTIMAS 10 entradas de `docs/planning/04-PROGRESS-LOG.md`
8. `docs/planning/05-CLEANUP-INVENTORY.md` (só a seção de status atual)
9. `docs/planning/06-TESTING-STRATEGY.md`

Depois, me responda em até 10 linhas:

- Em qual item do backlog o trabalho parou?
- Qual é o status dele?
- Há bloqueio ativo?
- Qual é o próximo item da fila segundo `03-EXECUTION-PLAN.md`?
- Que dúvida você tem antes de começar?

PARE aqui e aguarde meu OK ou correção.

## PASSO 2 — Execução (após meu OK)

Quando eu aprovar o alvo:

1. Mude o status do item em `docs/planning/02-BACKLOG.md` para `IN_PROGRESS` com seu nome (ex: `IN_PROGRESS (Codex, 2026-04-20)`).
2. Atualize `docs/planning/03-EXECUTION-PLAN.md` na seção "Em execução agora".
3. Execute.
4. Respeite as regras de `AGENTS.md` — em particular:
   - Existência ≠ funcionamento. Só feche com teste automatizado.
   - Nunca delete; arquive em `.archive/YYYY-MM-DD/`.
   - Um item = um commit (formato em `AGENTS.md` seção 4.4).

## PASSO 3 — Encerramento (OBRIGATÓRIO antes de terminar)

Antes de encerrar a sessão, faça TODOS estes passos:

1. Atualize `docs/planning/02-BACKLOG.md`: status do item (DONE / PARTIAL / BLOCKED).
2. Adicione entrada NOVA no TOPO de `docs/planning/04-PROGRESS-LOG.md` seguindo o formato do próprio arquivo.
3. Se mexeu em classificação de módulo/rota, atualize `docs/planning/05-CLEANUP-INVENTORY.md`.
4. Se a maturidade de algum domínio mudou, atualize `docs/planning/01-MATURITY-MATRIX.md` e registre na tabela "Histórico de mudanças".
5. Atualize `docs/planning/03-EXECUTION-PLAN.md`: tire o item de "Em execução agora", coloque o próximo da fila se for óbvio.
6. Commit final (pode ser squash) seguindo formato de `AGENTS.md`.

## REGRAS DA SESSÃO

- Se encontrar algo que não está no plano, NÃO ignore e NÃO invente plano novo: adicione um item em `02-BACKLOG.md` e avise.
- Se tiver que escolher entre "entregar rápido parcial" ou "entregar provado completo", escolha SEMPRE provado — marcando o resto como `PARTIAL` com item de backlog novo.
- Se encontrar código órfão / zombie / fake, anote em `05-CLEANUP-INVENTORY.md` e me pergunte antes de tocar.
- Se o teste não existir, crie o teste ANTES de marcar DONE.
- Se algo está ambíguo, pare e pergunte ao Paulo. Não adivinhe arquitetura.

Meu objetivo é que, daqui a 3 meses, qualquer agente (Codex, Claude Code, Gemini) consiga abrir este repo, ler esses 9 arquivos e retomar o trabalho sem perder contexto. Protege isso acima de velocidade.

Comece pelo PASSO 1 agora.
===END===
```

---

## Dica de uso

- **Primeira sessão após bootstrap:** use este prompt; o agente começa por `T1-DEVSERVER`.
- **Qualquer sessão seguinte:** mesmo prompt, independente de qual agente.
- **Mudança de agente no meio de um item:** o novo agente lê o log e continua — sem rework.
- **Se quiser forçar um alvo específico**, após o PASSO 1 do agente, responda algo como: `OK, mas quero atacar T2-PARCEL-E2E agora, não T1-ROUTE-PROOF.` O agente registra e segue.
