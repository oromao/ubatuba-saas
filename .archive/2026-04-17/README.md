# FlyDea — Sistema de Planejamento + Execução Autônoma

Bundle completo. 3 passos para colocar em produção hoje.

---

## 📦 O que tem aqui

```
.
├── AGENTS.md                              ← fonte de verdade para agentes
├── CLAUDE.md / GEMINI.md                  ← ponteiros para AGENTS.md
│
├── CODEX-PROMPT-BOOTSTRAP.md              ← passo 2 (rodar 1x hoje)
├── CODEX-PROMPT-AUTONOMOUS.md             ← passo 3 (rodar hoje e sempre)
├── CODEX-PROMPT-CONTINUE.md               ← opcional (modo cauteloso)
│
└── docs/planning/
    ├── 00-PROJECT-CONTEXT.md
    ├── 01-MATURITY-MATRIX.md
    ├── 02-BACKLOG.md                      ← tarefas T1→T4 com status
    ├── 03-EXECUTION-PLAN.md
    ├── 04-PROGRESS-LOG.md                 ← histórico append-only
    ├── 05-CLEANUP-INVENTORY.md
    ├── 06-TESTING-STRATEGY.md
    └── 07-DEFINITIONS.md
```

---

## ▶️ PASSO 1 — Instalar no repo FlyDea (2 min)

Copie tudo deste bundle para a raiz do seu repo:

```bash
# no terminal, dentro do repo FlyDea
cp -r <pasta-extraida>/* .
git add AGENTS.md CLAUDE.md GEMINI.md CODEX-PROMPT-*.md docs/planning
git commit -m "chore(planning): install FlyDea plan system"
```

---

## ▶️ PASSO 2 — BOOTSTRAP (rodar 1x, hoje)

**Para que serve:** limpar arquivos de planejamento antigos do repo (ROADMAPs antigos, TODO.md, notas soltas) que atrapalham os agentes.

1. Abra `CODEX-PROMPT-BOOTSTRAP.md`
2. Copie o bloco entre `===BEGIN===` e `===END===`
3. Cole no Codex CLI dentro do repo
4. Ele faz auditoria e te mostra relatório
5. Você responde `PROSSEGUIR`
6. Ele arquiva tudo em `.archive/YYYY-MM-DD/` e commita

**Depois disso, não precisa rodar de novo. Nunca.**

---

## ▶️ PASSO 3 — AUTONOMOUS (rodar hoje e nas próximas sessões)

**Para que serve:** agente entra em modo full-auto, ataca o backlog T1→T2 sozinho, comita cada tarefa, atualiza o plano.

1. Abra `CODEX-PROMPT-AUTONOMOUS.md`
2. Copie o bloco entre `===BEGIN===` e `===END===`
3. Cole no Codex CLI (com `--full-auto` habilitado)
4. Vai almoçar
5. Volta e lê os reports de cada tarefa concluída

**Este é o prompt que você usa de agora em diante, toda sessão.**

---

## 🗺️ Fluxo completo

```
HOJE:
  Passo 1 (manual) → Passo 2 (bootstrap, 1x) → Passo 3 (autonomous)

AMANHÃ E SEMPRE:
  Passo 3 (autonomous)
```

---

## 🚨 Quando usar o CODEX-PROMPT-CONTINUE.md (opcional)

Apenas se quiser modo **cauteloso**: o agente lê tudo, te mostra onde parou, e aguarda sua aprovação antes de cada passo. Mais lento, mais controle.

Se o seu objetivo é "agente age sem perguntar muito" → ignore este, use o AUTONOMOUS.

---

## 📋 Regras invioláveis (resumo do AGENTS.md)

1. **Existência ≠ funcionamento.** Sem teste, não é DONE.
2. **Nunca deletar.** Arquivar em `.archive/YYYY-MM-DD/`.
3. **Sempre atualizar o plano** ao fim da sessão (AGENTS.md §14).
4. **Um item do backlog = um commit.** Rastreabilidade total.
5. **Paulo decide** arquitetura. Em dúvida, o agente pergunta.

---

Gerado por Claude em 2026-04-17 para Paulo (Catanduva-SP).
