# Prompt Bootstrap — rode UMA VEZ para instalar o sistema de planejamento

> Cole exatamente o texto abaixo (do `===BEGIN===` ao `===END===`, sem incluir as linhas de marcador) no Codex CLI, Claude Code ou Gemini CLI, dentro da raiz do seu repositório.

---

```
===BEGIN===
# MISSÃO

Você é um agente de engenharia agindo em modo de bootstrap. Sua missão tem 3 partes, nesta ordem exata:

## PARTE 1 — Instalar o sistema de planejamento

Eu vou te fornecer em anexo (ou já estão no diretório atual, em `docs/planning/` e `AGENTS.md`) um conjunto de arquivos de planejamento. Verifique se todos existem:

- `AGENTS.md` (raiz)
- `CLAUDE.md` (raiz)
- `GEMINI.md` (raiz)
- `docs/planning/00-PROJECT-CONTEXT.md`
- `docs/planning/01-MATURITY-MATRIX.md`
- `docs/planning/02-BACKLOG.md`
- `docs/planning/03-EXECUTION-PLAN.md`
- `docs/planning/04-PROGRESS-LOG.md`
- `docs/planning/05-CLEANUP-INVENTORY.md`
- `docs/planning/06-TESTING-STRATEGY.md`
- `docs/planning/07-DEFINITIONS.md`

Se QUALQUER um não existir, pare e me avise. NÃO crie você mesmo — eles têm conteúdo específico.

Leia os 11 arquivos acima INTEIROS antes de seguir.

## PARTE 2 — Auditoria de arquivos conflitantes

Faça uma varredura do repositório procurando TODOS os arquivos abaixo que podem competir ou conflitar com o novo sistema de planejamento:

Alvos de varredura:
- Qualquer `README*.md` na raiz ou em `docs/` que contenha plano, roadmap, prioridades ou backlog que divirjam dos arquivos em `docs/planning/`.
- Qualquer arquivo `TODO*`, `ROADMAP*`, `PLAN*`, `PLANO*`, `BACKLOG*`, `NOTES*`, `NOTAS*`, `ANALISE*`, `ANALYSIS*`, `AUDIT*`, `AUDITORIA*` em qualquer pasta.
- Arquivos `.md` dentro de `docs/` que não estejam em `docs/planning/` e que tenham sobreposição temática (planejamento, prioridades, próximos passos, maturidade, limpeza).
- Pastas `docs/archive/`, `docs/old/`, `docs/legacy/`, `docs/drafts/`.
- Comentários de código com `TODO`, `FIXME`, `HACK`, `XXX`, `DEMO`, `MOCK` — listar, não remover.
- Qualquer `.md` na raiz que não seja `README.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `LICENSE*`, `CONTRIBUTING*`, `CHANGELOG*`, `SECURITY*`, `CODE_OF_CONDUCT*`.

Para cada achado, classifique usando os rótulos de `docs/planning/05-CLEANUP-INVENTORY.md`:
- `KEEP` — não tem conflito, permanece.
- `MERGE` — contém informação útil, deve ser consolidada em algum arquivo de `docs/planning/` e depois arquivada.
- `ARCHIVE` — conflita ou está obsoleto, mover para `.archive/YYYY-MM-DD/` (onde YYYY-MM-DD é hoje).
- `KEEP_BUT_FLAG` — é legítimo mas precisa de nota no `05-CLEANUP-INVENTORY.md`.

NÃO MEXA em nada ainda. Apenas produza um RELATÓRIO no formato:

```
## Relatório de auditoria — <data>

### Arquivos encontrados (N no total)

| Caminho | Tamanho | Última modificação | Classificação proposta | Justificativa curta |
|---|---|---|---|---|
| docs/ROADMAP.md | 12KB | 2025-11-03 | MERGE | Contém backlog antigo, 70% já coberto por 02-BACKLOG.md |
...

### Conteúdo útil a preservar (para MERGE)

Para cada arquivo MERGE, liste 2-5 bullets do conteúdo que deve ir para qual arquivo de docs/planning/.

### Proposta de limpeza

Total ARCHIVE: N arquivos (listar caminhos)
Total MERGE: N arquivos (listar caminhos + destino)
Total KEEP_BUT_FLAG: N arquivos
Total KEEP: N arquivos (não listar, só total)
```

PARE aqui e aguarde minha aprovação explícita antes de executar qualquer movimentação.

## PARTE 3 — Execução da limpeza (APÓS aprovação)

Após eu aprovar com a palavra "PROSSEGUIR" (ou com uma lista específica de quais aprovo), execute:

1. Crie `.archive/YYYY-MM-DD/` na raiz (onde YYYY-MM-DD é hoje).
2. Para cada arquivo `ARCHIVE`: `git mv <original> .archive/YYYY-MM-DD/<mesmo caminho relativo>`.
3. Para cada arquivo `MERGE`:
   a. Extraia o conteúdo útil.
   b. Adicione-o ao arquivo de destino em `docs/planning/` em uma seção nova com título `## Mesclado de <caminho original> em <data>`.
   c. `git mv` o arquivo original para `.archive/YYYY-MM-DD/`.
4. Atualize `docs/planning/05-CLEANUP-INVENTORY.md`:
   - Preencha a tabela "Arquivos/pastas suspeitos de serem lixo de planejamento".
   - Preencha a tabela "Histórico de arquivamento".
5. Adicione entrada em `docs/planning/04-PROGRESS-LOG.md` no formato do arquivo.
6. Commit único com mensagem:
   ```
   chore(planning): install plan system + archive N conflicting docs

   - Installed docs/planning/ (8 files) + AGENTS.md / CLAUDE.md / GEMINI.md
   - Archived N files to .archive/<data>/
   - Merged N files into docs/planning/
   - Ref: docs/planning/05-CLEANUP-INVENTORY.md
   ```

## REGRAS INVIOLÁVEIS

- NUNCA use `rm` ou `git rm`. Use SEMPRE `git mv` para `.archive/`.
- NUNCA modifique conteúdo de `docs/planning/` fora do que está especificado aqui.
- Se algo não couber em nenhuma classificação, marque como `NEEDS_DECISION` e me pergunte.
- Se encontrar mais de 50 arquivos conflitantes, pare e me avise — pode ser que o sistema de planejamento deste repo seja maior do que o anexado.
- NÃO rode testes nem builds nesta etapa — a limpeza não deve quebrar nada, mas a validação vem num prompt separado.

Ao terminar a PARTE 2, pare e me mostre o relatório.

===END===
```

---

## O que fazer depois do bootstrap

1. **Revise** o relatório da PARTE 2 antes de aprovar.
2. Se tudo certo, responda `PROSSEGUIR` (ou liste quais itens aprova).
3. Depois do commit, rode manualmente `pnpm install && pnpm test:smoke` (ou equivalente) para confirmar que nada quebrou.
4. A partir daí, use o **Prompt de Continuação** (arquivo `CODEX-PROMPT-CONTINUE.md`) em cada sessão.
