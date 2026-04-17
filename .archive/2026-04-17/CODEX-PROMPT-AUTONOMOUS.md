# Prompt AUTONOMOUS DRIVE — FlyDea

Use este prompt quando quiser que o Codex/Claude Code/Gemini dirija sozinho por várias tarefas, sem te perguntar a cada passo.

**Pré-condições:** `AGENTS.md` e `docs/planning/*` instalados. `02-BACKLOG.md` populado.

**Recomendado rodar com:**
- Codex CLI: `codex --full-auto` (ou equivalente de auto-approve)
- Claude Code: auto-approve edits + bash habilitado
- Gemini CLI: modo autônomo habilitado

---

Cole o bloco abaixo entre `===BEGIN===` e `===END===` (sem os marcadores) no agente:

```
===BEGIN===
# FLYDEA — AUTONOMOUS EXECUTION SESSION

Read `AGENTS.md` now. It is binding. Do not summarize it back to me.

## MODE: FULL AUTO

You drive. I am not in the loop.
Do not ask me to choose between obvious options.
Pick tasks, execute, validate, update plan, commit, continue.

## OBJECTIVE (this session)

Primary: close the First Execution Package (AGENTS.md §7) by completing T1 → T2 in `02-BACKLOG.md` order.
Secondary: while touching any module, classify its `TBD` rows in `05-CLEANUP-INVENTORY.md` and archive/hide FAKE/ZOMBIE as you find them.

Order of attack:
1. T1-DEVSERVER
2. T1-HYDRATION
3. T1-ROUTE-PROOF
4. T2-PARCEL-E2E
5. T2-INSPECT-E2E (parallel with T2-TAX-INTEG allowed after PARCEL-E2E)
6. T2-TAX-INTEG
7. T2-REPORTS

Do NOT touch T3/T4 until T1 is fully DONE.

## AUTHORIZED WITHOUT ASKING

- Pick next task per `02-BACKLOG.md` priority
- Read, patch, refactor within current task scope
- Create/update tests at any level of the pyramid (§20)
- Archive files via `git mv` → `.archive/YYYY-MM-DD/<original-path>`
- Update all `docs/planning/*` per §14
- Commit per §14 format
- Move to the next task when current is DONE or PARTIAL (PARTIAL must open a new backlog item)
- Classify `TBD` routes in `05-CLEANUP-INVENTORY.md` based on what you observe

## STOP AND ASK (do NOT proceed without me)

1. Refactor outside current task scope touching >5 files
2. Adding or removing any dependency (package.json / requirements.txt / etc.)
3. Database migration with data-loss risk
4. Removing an entire module (even to archive)
5. Ambiguous domain rule: tax formula, RBAC policy, LGPD handling, multi-tenant isolation
6. Same task blocked 2 consecutive attempts → stop, log why, ask
7. Any change to `AGENTS.md` itself

## HARD RULES (restated from AGENTS.md)

- No DONE without automated test proving the flow (§6, §24)
- No session ends without §14 plan update
- Never `rm` / `git rm` / `git clean -fd`. Archive only (§17)
- Output format is §15. No essays. No prose > 10 lines per response.
- Single Writer. No parallel writes (§13)
- Use vocabulary from §5 (REAL / PARTIAL / ZOMBIE / FAKE / DEAD). Never say "ready", "working", "done" bare.

## EXECUTION LOOP (repeat until end condition)

```
pick_task()                         # top priority TODO in 02-BACKLOG.md
  → mark IN_PROGRESS (you, date) in 02-BACKLOG.md
  → update 03-EXECUTION-PLAN.md "in progress now"
  → inspect files (narrow, only what the task needs)
  → patch
  → validate:
      - run existing tests (must stay green)
      - write new tests for this task (§20)
      - all green or classify as PARTIAL
  → §14 update:
      - 02-BACKLOG.md status
      - 04-PROGRESS-LOG.md new entry at top
      - 03-EXECUTION-PLAN.md (what's next)
      - 01-MATURITY-MATRIX.md if a domain score changed
      - 05-CLEANUP-INVENTORY.md if classification changed
  → commit (§14 format, one commit per task)
  → report to me (§15 compact format)
  → next
```

## END CONDITIONS

End the session when ONE of:
- All T1 items are DONE → report + stop
- All T1 AND T2 DONE → report + stop (hard pause for my review)
- Blocker from STOP-AND-ASK list → report + stop
- You are about to hit context/token limit → complete §14 for the current task, commit, then stop
- 8 consecutive tasks completed without my review → stop for sanity check

Do NOT end because:
- A task was hard
- You need "more context" (you have the filesystem — use it)
- You'd prefer to confirm (the STOP-AND-ASK list is exhaustive; if not on it, decide)

## ANTI-STALL

If you catch yourself doing any of:
- re-auditing the repo → stop, go to `02-BACKLOG.md`
- asking me between two options aligned with AGENTS.md → pick one, log the choice in `04-PROGRESS-LOG.md`
- polishing unrelated code → stop, return to task
- writing explanatory prose → truncate, use §15
- reading files you don't need for this task → stop

## SAFETY NET

Before every commit:
- `git status` clean except intended changes
- tests run and green (or PARTIAL explicit in backlog)
- §14 files updated in the same commit
- commit message follows §14 format

If any of the above fails → fix it, do NOT commit broken state.

## GO

Start now.
Step 1: read the AGENTS.md §3 mandatory list (all 9 files).
Step 2: identify the next task per the order above (T1-DEVSERVER first).
Step 3: enter the execution loop.
Do not wait for me. Do not ask to start. Begin.

===END===
```

---

## Quando usar este prompt vs os outros

| Situação | Prompt |
|---|---|
| Primeira instalação do sistema | `CODEX-PROMPT-BOOTSTRAP.md` |
| Sessão cuidadosa, você quer aprovar cada passo | `CODEX-PROMPT-CONTINUE.md` |
| Sessão autônoma, você vai almoçar e quer o trabalho andando | **este aqui** |
| Debug de um problema específico que você conhece | nenhum — fale direto com o agente |

## Como te reportar durante a sessão

O agente vai te mandar updates no formato §15 a cada tarefa concluída:

```
1. task: T1-DEVSERVER
2. root cause: cache do Next não era limpo entre builds
3. files changed: package.json, .github/workflows/ci.yml
4. validation: 5/5 runs limpos em CI (link)
5. fixed: verify:clean agora reprodutível
6. NOT PROVEN: nenhum
7. plan update: yes — 02-BACKLOG.md, 04-PROGRESS-LOG.md, 01-MATURITY-MATRIX.md, 03-EXECUTION-PLAN.md
8. next task: T1-HYDRATION
```

Se vier report sem o item 7 preenchido, ele violou §14 — chame isso de volta imediatamente.

## Se ele parar no meio (blocker)

Quando ele bate em STOP-AND-ASK ou end condition, ele para e te manda um report com:
- qual condição acionou a parada
- em qual tarefa estava
- o que falta
- sugestão de próximo passo

Você responde a dúvida dele, ou cola novamente este mesmo prompt para retomar (ele vai ler o log, pegar onde parou, e seguir).

## Recomendação de primeira execução

Na primeira vez que rodar o autonomous drive:

1. Rode primeiro o `CODEX-PROMPT-CONTINUE.md` uma vez, para garantir que o agente leu tudo e o estado do plano está consistente.
2. Revise o report dele em ~5 minutos.
3. Se estiver alinhado, cole este `AUTONOMOUS DRIVE` e deixe rodar.

A partir da segunda execução, pode ir direto no autonomous.
