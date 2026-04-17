# Sistema de Planejamento Persistente — govtech municipal

Este bundle instala um sistema de planejamento em arquivos markdown que sobrevive entre sessões de qualquer agente de IA (Codex CLI, Claude Code, Gemini CLI, Cursor, etc.).

## O que tem aqui

```
.
├── AGENTS.md                              ← entrada universal para agentes
├── CLAUDE.md                              ← ponteiro para AGENTS.md (Claude Code)
├── GEMINI.md                              ← ponteiro para AGENTS.md (Gemini CLI)
├── CODEX-PROMPT-BOOTSTRAP.md              ← prompt para rodar UMA VEZ
├── CODEX-PROMPT-CONTINUE.md               ← prompt para rodar a CADA sessão
└── docs/planning/
    ├── 00-PROJECT-CONTEXT.md              ← o que é o projeto
    ├── 01-MATURITY-MATRIX.md              ← scorecard por domínio
    ├── 02-BACKLOG.md                      ← tarefas T1→T4 com status
    ├── 03-EXECUTION-PLAN.md               ← sprint atual
    ├── 04-PROGRESS-LOG.md                 ← histórico append-only
    ├── 05-CLEANUP-INVENTORY.md            ← o que arquivar/esconder
    ├── 06-TESTING-STRATEGY.md             ← pirâmide de testes
    └── 07-DEFINITIONS.md                  ← vocabulário (REAL/PARTIAL/ZOMBIE/FAKE/DEAD)
```

## Como instalar no seu repositório

### Opção A — copiar manualmente

1. Copie a pasta `docs/planning/` e os 3 arquivos `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` para a raiz do seu repo govtech.
2. Commite: `git add docs/planning AGENTS.md CLAUDE.md GEMINI.md && git commit -m "chore(planning): install persistent planning system"`
3. Abra o `CODEX-PROMPT-BOOTSTRAP.md` e rode o prompt nele com qualquer agente para fazer a limpeza do repo.

### Opção B — rodar o bootstrap direto

1. Coloque os arquivos na raiz do repo.
2. Abra `CODEX-PROMPT-BOOTSTRAP.md` no seu IDE.
3. Copie o conteúdo entre `===BEGIN===` e `===END===`.
4. Cole no Codex CLI / Claude Code / Gemini CLI dentro do repo.
5. Revise o relatório de auditoria.
6. Aprove com `PROSSEGUIR`.
7. Commit final é feito pelo próprio agente.

## Como usar a partir daí

### No início de CADA sessão (independente de qual agente):

1. Abra `CODEX-PROMPT-CONTINUE.md`.
2. Copie o conteúdo entre `===BEGIN===` e `===END===`.
3. Cole no agente.
4. Ele lê o estado atual, te mostra onde parou, propõe o próximo passo.
5. Aprove ou redirecione.
6. Ele executa, atualiza o plano, commita.

### Troca de agente no meio do trabalho

Funciona. O próximo agente lê `docs/planning/04-PROGRESS-LOG.md` e retoma sem rework. Esse é o ponto principal do sistema.

## Princípios que o sistema impõe

1. **Existência ≠ funcionamento.** Sem teste, não é DONE.
2. **Nunca deletar.** Sempre arquivar em `.archive/YYYY-MM-DD/`.
3. **Sempre atualizar o plano.** O log é parte do trabalho.
4. **Um item = um commit.** Rastreabilidade total.
5. **Paulo decide.** Em dúvida arquitetural, o agente pergunta.

## Quando atualizar o plano

- **00-PROJECT-CONTEXT:** só em mudança arquitetural grande. Raro.
- **01-MATURITY-MATRIX:** a cada final de sprint, ou quando um domínio subiu/desceu nível.
- **02-BACKLOG:** toda sessão que toca um item.
- **03-EXECUTION-PLAN:** início e fim de toda sessão.
- **04-PROGRESS-LOG:** fim de toda sessão (append-only).
- **05-CLEANUP-INVENTORY:** sempre que arquivar/limpar algo.
- **06-TESTING-STRATEGY:** quando a pirâmide mudar.
- **07-DEFINITIONS:** quase nunca. Só se o vocabulário evoluir.

---

Gerado por Claude em 2026-04-17 para Paulo (Catanduva-SP).
