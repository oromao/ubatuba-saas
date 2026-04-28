# 00 — AGENT QUICKSTART

**O PRIMEIRO arquivo a ler quando iniciar.** Objetivo: **entender o projeto em < 2 minutos**.

---

## 1. O QUE É FLYDEA

FlyDea é uma **SaaS GovTech multi-tenant** para **gestão territorial municipal** (São Paulo como referência).

**Núcleo**: GIS + Cadastro Territorial Multi (CTM) + Tributação (IPTU/PGV).

**Entidade central**: **Parcela/Lote**.

**Stack**: NestJS (API), Next.js (App Router), MongoDB, Docker.

---

## 2. FASE ATUAL: T5+ (REALIDADE SÃO PAULO)

**Contexto**: T1–T4 fechados (bugs de sobrevivência). **PRONTO? NÃO.**

**Realidade**: Sistema funciona com **dados sintéticos**, **QUEBRA** com dados reais de São Paulo (50k+ lotes):
- **Não converte CRS UTM** → lote plotado no Congo
- **Import duplica** → base corrompida
- **GIS sem bbox** → browser crash com 50k
- **Sem índice 2dsphere** → queries lentas

**Missão atual**: **Provar** que funciona com **dados reais de São Paulo** (GeoSampa).

**Maturidade alvo**: **4.0/5.0** (robusto para produção SP).

---

## 3. FONTES DA VERDADE (OBRIGATÓRIAS)

Leia **APENAS** estes arquivos (qualquer outro = desperdício de tokens):

1. **`AGENTS.md`** (raiz) — regras do jogo  
2. **`docs/agents/00-AGENT-QUICKSTART.md`** (este arquivo) — resumo  
3. **`docs/planning/03-EXECUTION-PLAN.md`** — o que executar **AGORA**  
4. **`docs/planning/04-PROGRESS-LOG.md`** (TOPO) — última sessão  

**EVITE**:
- ❌ Não leia todos os docs/planning/ → só 03 e 04
- ❌ Não abra docs antigos → provavelmente desatualizados
- ❌ Não confie em arquivos `.archive/` → são arquivos mortos
- ❌ Não escaneie `/tests/` inteiro → é muito grande

**Se visto de arquivo antigo/mover/duplicado**: Verifique `05-CLEANUP-INVENTORY.md` primeiro.

---

## 4. ORDEM DE EXECUÇÃO ATUAL

**Prioridade #1**: **Dados reais de São Paulo**
1. T7-SP-IMPORT-GEOJSON-REAL — importar GeoSampa
2. T7-SP-CRS-TRANSFORM — converter UTM→WGS84
3. T6-SP-GIS-BBOX-VIEWPORT — carregar só viewport
4. T6-SP-GIS-TILE-MVT — tiles vetoriais para escala
5. T5-SP-TEST-PROOF — e2e com dados reais

**Formulário import**: Use fixture em `test/fixtures/sp-geosampa-sample.geojson`.

---

## 5. COMO TRABALHAR

**Ciclo de 1 tarefa**:
1. **Leia** `03-EXECUTION-PLAN.md` → qual a tarefa atual?
2. **Leia** arquivos **mínimos** necessários para tarefa
3. **Implemente** → **teste** → **valide**
4. **Faça append** em `04-PROGRESS-LOG.md` (formato obrigatório)
5. **Update** status na tarefa em `02-BACKLOG.md` se DONE/PARTIAL/BLOCKED
6. **Contínue** → próxima tarefa

**Regra de ouro**: **exists ≠ works**.
Até ter **prova automatizada** → é **ZOMBIE/FAKE**.

---

## 6. O QUE NÃO FAZER

- ❌ **NÃO** re-audit todo o sistema
- ❌ **NÃO** leia arquivos `.md` antigos a menos que referenciado
- ❌ **NÃO** confie em arquivos marcados DONE sem prova
- ❌ **NÃO** extraia contexto do `.archive/`
- ❌ **NÃO** execute testes manualmente (use `pnpm test`)
- ❌ **NÃO** modifique arquivos não listados na tarefa

---

## 7. COMANDOS DE TRABALHO

**Build:**
```bash
npm --prefix apps/api run build
npm --prefix apps/web run build
```

**Testes:**
```bash
npm --prefix apps/api test -- --runInBand
# E2E (Playwright) em apps/web
pnpm test:e2e:full
pnpm test:smoke
```

**Dev:**
```bash
docker compose --profile dev up -d --build
```

**Limpar cache:**
```bash
rm -rf .next node_modules/.cache
```

---

## 8. DEFINITION OF DONE (STRICT)

Uma tarefa só está **DONE** se:

- ✅ Funciona **end-to-end** (UI → API → DB)
- ✅ **Testes automatizados** passam (não manual)
- ✅ **Dados reais de São Paulo** usados (não mock)
- ✅ 3 execuções consecutivas passam (não flake)
- ✅ Atualização **04-PROGRESS-LOG.md** (mandatório)
- ✅ **02-BACKLOG.md** atualizado (se DONE/PARTIAL/BLOCKED)

**NÃO DONE**:
- ❌ "parece funcionar" → não é prova
- ❌ "testei manualmente" → não é automatizado
- ❌ "local passou" → não passou 3x
- ❌ "vai funcionar" → especulação

---

## 9. QUICK GUIDE PARA AGENTES DEBUGGING

**Crashes com dados SP?**: Verifique `CRS` → converteu UTM→4326?

**Import falha silencioso?**: Limpou `.next` cache? Lazy loader Node.js?

**Rotas sem prova?**: Na sprint atual: `pnpm test:smoke:routes` para validar.

**Playwright flake?**: Aumente timeout, remova intercept em favor de `storageState` real.

**Qual fixture usar?**: `test/fixtures/sp-geosampa-sample.geojson` (real SP). **NÃO** `demo-parcels.geojson` (fake).

---

## 10. DON'T PANIC

**Se algo parece muito complexo**: Simplifique. Um teste falhou > 2x? → **Skip**. Tarefa requer mais que 3 arquivos? → **Quebre**.

**Se travado em algum arquivo**: **Pedir ao Paulo** ou **ABORTAR** para próximo agente.

**Se não entende o contexto**: **Leia este arquivo novamente**.

**Se tokenizer explode**: **Pare** de ler arquivos grandes. Use `exec awk` ou `grep -A 10` para extrair apenas seções necessárias.

---

## 11. MATURIDADE ESPERADA POR FASE

- **T1 (DONE)**: Sobrevive, não crasha → **Concluído**
- **T2 (DONE)**: Robustez básica → **Concluído**
- **T3/4 (PARTIAL)**: Precisa prova com SP real → **NÃO CONFIÁVEL**
- **T5**: Provar que funciona → **Alvo 2026-05-12**
- **T6**: Escalar GIS → **Alvo 2026-05-19**
- **T7**: Dados reais SP → **Alvo 2026-05-26**
- **T8**: Paridade GeoPixel → **Alvo 2026-06-09**

**Hoje**: **2.85/5.0 MVP frágil**. **SWEAT TOKEN**: **Nenhum arquivo .md extra, nenhum rescan, nenhum resumo estrutural. Use comandos curto, focado.**

---

## 12. ÚLTIMA LINHA

**Se você só pode lembrar de 1 coisa**: **EXISTS ≠ WORKS**.

Agora execute. 💪
