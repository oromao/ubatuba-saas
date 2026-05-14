# Backlog FlyDea — Baseado no Estado REAL do Projeto

## Legenda
| Tier | Foco |
|---|---|
| **T0** | Deploy + CI/CD — sem isso não há produção |
| **T1** | Validação com dados reais de SP |
| **T2** | Qualidade — lint, testes, build |
| **T3** | Maturidade — monitoring, DR, security |

---

## Sprint 1 — Segurança + Deploy VPS

### 🔴 T0 — Segurança Crítica (urgente)
- [ ] **FLY-SEC-001** — Remover Mongo Express da exposição pública (porta 8081)
- [ ] **FLY-SEC-002** — Remover GeoServer da exposição pública (porta 8080) ou proteger com auth
- [ ] **FLY-SEC-003** — Remover MinIO Console da exposição pública (porta 9001)
- [ ] **FLY-SEC-004** — Migrar para profile prod com nginx reverse proxy
- [ ] **FLY-SEC-005** — SSL/HTTPS (Let's Encrypt + nginx)
- [ ] **FLY-SEC-006** — Rotacionar todas as senhas hardcoded no .env.prod

### T0 — Pipeline e Deploy
- [ ] **FLY-001** — CI/CD GitHub Actions: build + lint + test
- [ ] **FLY-002** — Docker images: API + Web buildadas no CI
- [ ] **FLY-003** — Deploy automatizado via SSH + Docker Compose na VPS
- [ ] **FLY-004** — Secrets via GitHub Secrets (não .env)
- [ ] **FLY-005** — Script de rollback
- [ ] **FLY-006** — Health check endpoint

### T2 — Qualidade
- [ ] **FLY-020** — Backend lint: 0 errors (atualmente ~50)
- [ ] **FLY-021** — Frontend lint: 0 errors
- [ ] **FLY-022** — Build API sem warnings
- [ ] **FLY-023** — Build Web sem warnings

---

## Sprint 2 — Validação SP + Testes

### T1 — Dados Reais
- [ ] **FLY-030** — Validar importação GeoSampa setores 001-005 no mapa
- [ ] **FLY-031** — Corrigir CRS/geometria se necessário (WGS84 ↔ UTM 23S)
- [ ] **FLY-032** — Cálculo IPTU com dados reais (parcela com valor venal)
- [ ] **FLY-033** — PGV com zonas reais (não mock)
- [ ] **FLY-034** — Busca de parcela por inscrição imobiliária

### T3 — Testes
- [ ] **FLY-040** — E2E: fluxo mapa → parcela → detalhe (com dados SP)
- [ ] **FLY-041** — E2E: fluxo IPTU (selecionar parcela → calcular → exibir guia)
- [ ] **FLY-042** — E2E: fluxo PGV (zonas → faces → valuation)
- [ ] **FLY-043** — Testes de isolamento multi-tenant (tenant A não vê dados B)

---

## Sprint 3 — Maturidade

### T3
- [ ] **FLY-050** — Health check endpoint (/health) com dependências
- [ ] **FLY-051** — CloudWatch logs estruturados (API + Web)
- [ ] **FLY-052** — Backup MongoDB automatizado (já existe script)
- [ ] **FLY-053** — Restore MongoDB testado
- [ ] **FLY-054** — Trivy image scanning no CI
- [ ] **FLY-055** — Secrets rotacionados (não hardcoded)

## Itens Contínuos
- [ ] **FLY-999** — Atualizar .ai/current-task.md
- [ ] **FLY-998** — Archive em vez de delete
- [ ] **FLY-997** — Atualizar progress log
