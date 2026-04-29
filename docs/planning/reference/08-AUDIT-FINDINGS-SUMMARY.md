# 08 — Audit Findings Summary (Quick Reference)

> Resumo executivo de 2026-04-24. Uso rápido para começar sprints.
> Versão estruturada para múltiplas IAs.

---

## 🔴 4 Bloqueadores Críticos (T1-AUDIT)

Resolver estes 4 items deixa o sistema operacional.

### 1. T1-AUDIT-PORTAL-CIDADAO — Erro 500 no envio

**Problema:** POST /api/cidadao/solicitacoes retorna 500. Cidadão não consegue enviar reclamação.

**Como testar:**
```bash
cd apps/api
curl -X POST http://localhost:4000/api/cidadao/solicitacoes \
  -H "Content-Type: application/json" \
  -d '{
    "categoria": "Infraestrutura",
    "assunto": "Buraco na rua",
    "descricao": "Rua Maria de Magdala tem buraco",
    "endereco": "Rua Maria de Magdala, 123"
  }'
# Esperado: 200 + protocolo
# Atual: 500 + erro genérico
```

**Onde investigar:**
1. `apps/api/src/modules/citizen-156/` — controller + service
2. Logs do docker: `docker logs ubatuba-saas-api-dev-1 | tail -50`
3. Validação de payload (faltam fields obrigatórios?)
4. Banco: está conectado? Tabela `citizen_requests` existe?

**Critério de aceite:**
- ✅ POST retorna 200
- ✅ Registro salva no DB
- ✅ Usuário vê mensagem "Solicitação enviada com protocolo #XYZ"
- ✅ Email de confirmação enviado (opcional)

**Esforço:** 6h (debug backend + teste)

---

### 2. T1-AUDIT-VISTORIAS — Botão não responde

**Problema:** Clique em "Nova Vistoria" em /app/ctm/vistorias não abre formulário.

**Como testar:**
```bash
# 1. Abrir localhost:3000/app/ctm/vistorias no navegador
# 2. Clicar em "Nova Vistoria" → NÃO FUNCIONA (esperado)
# 3. Verificar console do navegador (F12)
```

**Onde investigar:**
1. `apps/web/src/app/app/ctm/vistorias/page.tsx` — achar o botão e handler
2. Console do navegador: há erro JavaScript?
3. React DevTools: component renderiza? Click handler está atribuído?
4. `apps/api/src/modules/surveys/` — endpoint de criação existe?

**Critério de aceite:**
- ✅ Clique abre modal ou nova página
- ✅ Formulário tem campos: `data`, `tipo`, `responsável`, `observações`
- ✅ Botão "Salvar" persiste no DB
- ✅ Novo registro aparece na lista após reload

**Esforço:** 4h (frontend + teste)

---

### 3. T1-AUDIT-ROUTING — Múltiplas rotas redirecionam para dashboard

**Problema:**
- /app/relatorios → /app/dashboard
- /app/aprovacao → /app/dashboard
- /app/notificacoes → /app/notificacoes (correto)

**Como testar:**
```bash
# No navegador, tentar navegar para:
curl -s http://localhost:3000/app/relatorios -I | grep Location
# Se há redirect, mostra onde

# Ou no navegador:
# 1. Abrir http://localhost:3000/app/relatorios
# 2. Observar URL muda para /app/dashboard
```

**Onde investigar:**
1. `apps/web/src/middleware.ts` — há redirect global aqui?
2. `apps/web/next.config.js` — há redirects na config?
3. Layout hierarchy: `/app/layout.tsx` → há guard impedindo acesso?
4. Arquivo de rotas: `/app/relatorios/page.tsx` existe?

**Critério de aceite:**
- ✅ /app/relatorios carrega página de relatórios (mesmo que vazia)
- ✅ /app/aprovacao carrega página de aprovações (mesmo que vazia)
- ✅ Sem redirect não autorizado
- ✅ Guards de permissão funcionam (se implementado)

**Esforço:** 5h (revisar router + cleanup)

---

### 4. T1-AUDIT-CTM-EQUIPAMENTOS — Rota 404

**Problema:** /app/ctm/equipamentos retorna 404. Equipamentos públicos não catalogáveis.

**Como testar:**
```bash
curl -s http://localhost:3000/app/ctm/equipamentos | head -5
# Atual: 404 page
# Esperado: HTML da página
```

**Onde investigar:**
1. Arquivo `/app/ctm/equipamentos/page.tsx` — existe?
2. Se não existe, criar de forma similar a `/app/ctm/vistorias/page.tsx`
3. Menu: está apontando para essa rota? (`nav-config.ts`)
4. Backend: endpoint `/api/ctm/equipamentos` existe? Tipo: GET list

**Critério de aceite:**
- ✅ Rota carrega (sem 404)
- ✅ Página tem tabela com colunas (ID, TIPO, LOCALIZAÇÃO, STATUS)
- ✅ Sem dados inicialmente é OK
- ✅ Menu aponta corretamente

**Esforço:** 3h (criar página + integração)

---

## 📋 Próximos Passos Após T1-AUDIT

### T2-AUDIT Items (Semana 2)

| Item | Prioridade | Esforço |
|---|---|---|
| T2-AUDIT-TEST-DATA | ALTA | L (8h) |
| T2-AUDIT-MENU-FIXES | MÉDIA | S (2h) |
| T2-AUDIT-FEEDBACK-VISUAL | MÉDIA | S (2h) |

### T3-AUDIT Items (Semana 3+)

Refinement, error handling, UX improvements. Menos urgente.

---

## 🚀 Estrutura para Múltiplas IAs

### IA 1: Backend (Portal Cidadão)
- Tarefa: T1-AUDIT-PORTAL-CIDADAO
- Início: `apps/api/src/modules/citizen-156/`
- Teste: curl + E2E
- Entrega: POST 200 + DB persist

### IA 2: Frontend (Vistorias)
- Tarefa: T1-AUDIT-VISTORIAS
- Início: `apps/web/src/app/app/ctm/vistorias/page.tsx`
- Teste: Playwright + browser
- Entrega: Click → Modal → Save → Persist

### IA 3: Router (Roteamento)
- Tarefa: T1-AUDIT-ROUTING
- Início: `apps/web/src/middleware.ts` + `next.config.js`
- Teste: Navegação direta
- Entrega: Rotas carregam sem redirect

### IA 4: Frontend (CTM Equipamentos)
- Tarefa: T1-AUDIT-CTM-EQUIPAMENTOS
- Início: Criar `/app/ctm/equipamentos/page.tsx`
- Teste: Browser 200 + componente renderiza
- Entrega: Página lista (vazia OK)

---

## 📊 Status Atual (2026-04-24)

```
Auditoria Completa ✅
├─ 9 bugs identificados
├─ 5 críticos (T1-AUDIT)
├─ 4 médios (T2-AUDIT)
└─ 8 baixos/UX (T3-AUDIT)

Backlog Consolidado ✅
├─ 16 items estruturados
├─ DoD claro para cada
├─ Pronto para parallelização
└─ Estimativas de esforço

Sistema em VPS ✅
├─ Deploy testado
├─ Health check OK
└─ Pronto para demo

Gate de Licitação
├─ T1-AUDIT → 4/4 DONE (semana 1-2)
├─ T2-AUDIT → 3/3 DONE (semana 2-3)
├─ T4-AUDIT cleanup (ongoing)
└─ E2E CI/CD proof (needed)
```

---

## 💡 Quick Debugging Tips

### Logs do Backend
```bash
docker logs ubatuba-saas-api-dev-1 -f | grep -i error
# Ou com tail:
docker logs ubatuba-saas-api-dev-1 | tail -100
```

### Logs do Frontend
```bash
# Console do navegador (F12 → Console tab)
# Ou em logs do next dev:
pnpm dev # outputs Next.js logs
```

### Verificar se endpoint existe
```bash
curl -X GET http://localhost:4000/health # Should be 200
curl -X GET http://localhost:4000/api/ctm/vistorias # Should be 200 or 403, not 404
```

### Resetar banco de testes
```bash
# Se dados corrompidos ou querendo seed novo:
docker compose down -v  # Remove volumes (CUIDADO — perde dados)
docker compose --profile dev up -d --build
# Esperar ~30s, depois rodar seed novamente
```

---

## 📞 Comunicação Entre IAs

Quando uma IA termina uma tarefa:

1. **Update docs/planning/04-PROGRESS-LOG.md** com entrada clara
2. **Update docs/planning/02-BACKLOG.md** com status → DONE
3. **Update docs/planning/01-MATURITY-MATRIX.md** se módulo subiu de score
4. **Post em memory** se descobriu padrão reutilizável (ex: "Portal erro-handling pattern")

Exemplo de commit:
```
[T1-AUDIT-PORTAL-CIDADAO] Fix error 500 on citizen request submission

- Investigated citizen-156 controller validation
- Fixed missing field mapping in DTO
- Added comprehensive error handling
- E2E test passes in Playwright

Fixes #3 (audit finding)
```

---

## 🎯 Success Criteria (End of Week)

- [ ] T1-AUDIT-PORTAL-CIDADAO → DONE (cidadão envia protocolo real)
- [ ] T1-AUDIT-VISTORIAS → DONE (fiscal cria vistoria)
- [ ] T1-AUDIT-ROUTING → DONE (admin navega)
- [ ] T1-AUDIT-CTM-EQUIPAMENTOS → DONE (rota carrega)
- [ ] Deploy em VPS testado
- [ ] Deck de sales pronto

**Outcome:** Sistema operacional confiável, pronto para demo em licitação.
