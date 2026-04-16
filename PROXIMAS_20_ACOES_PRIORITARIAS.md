# PRÓXIMAS 20 AÇÕES PRIORITÁRIAS
**Objetivo**: Transformar FlyDea em produto viável para PoC com prefeitura  
**Escopo**: 6-8 semanas | **Prioridade**: Crítica

---

## SEMANA 1 — Validação + Vistoria Básica

### ✅ AÇÃO 1: Testar Implementações em Staging
- [ ] Deploy branch em ambiente staging
- [ ] Testar busca de lote (múltiplos critérios)
- [ ] Testar edição de lote (save/cancel)
- [ ] Testar navegação (click na tabela)
- **Owner**: QA | **Tempo**: 1h | **Blocker**: Não

### ✅ AÇÃO 2: Criar Formulário Dinâmico para Vistoria
- [ ] Scaffold: `/app/ctm/vistorias` (nova rota)
- [ ] Form fields: tipo_vistoria, data, observações, status
- [ ] Integração com Parcel (parcelId)
- [ ] Submit para POST `/ctm/vistorias`
- **Owner**: Frontend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 3: Criar Endpoint POST de Vistoria no Backend
- [ ] Schema: `Vistoria` (tipo, parcelId, data, obs, status, fotos[])
- [ ] Controller: `/ctm/vistorias` POST
- [ ] Service com validações básicas
- [ ] Repository para create
- **Owner**: Backend | **Tempo**: 2h | **Blocker**: Sim para AÇÃO 2

### ✅ AÇÃO 4: Adicionar Captura de Foto em Vistoria
- [ ] Upload form + preview
- [ ] Enviar para S3 (já configurado)
- [ ] Armazenar URL em Vistoria.fotos[]
- [ ] Multi-upload com validação
- **Owner**: Frontend | **Tempo**: 3h | **Blocker**: Não

### ✅ AÇÃO 5: Melhorar Navegação Sidebar
- [ ] Reduzir menu de 47 para 15 items máximo
- [ ] Agrupar em 4-5 seções claras:
  - 🏛️ Inteligência (Dashboard, Mapa, Observatório)
  - 📋 Cadastro (Parcelas, Logradouros, PGV)
  - 🔍 Operação (Vistoria, Processos, Monitoramento)
  - ⚙️ Administração (Integrações, Configuração)
- [ ] Remover menus vazios
- **Owner**: Product | **Tempo**: 2h | **Blocker**: Não

---

## SEMANA 2 — Dashboard + Relatórios

### ✅ AÇÃO 6: Dashboard Real com Dados do MongoDB
- [ ] GET `/dashboard/kpis` → retorna dados reais (query MongoDB)
- [ ] KPIs: Total de lotes, Lotes ATIVOS, Pendências
- [ ] Adicionar: Vistorias este mês, Processos abertos
- [ ] Gráfico simples: lotes por status (pie chart)
- **Owner**: Backend | **Tempo**: 3h | **Blocker**: Não

### ✅ AÇÃO 7: Relatório de Lote em PDF
- [ ] Endpoint: GET `/ctm/parcels/:id/report`
- [ ] Retorna PDF com:
  - Dados cadastrais completos
  - Mapa/geometria como imagem
  - Histórico de alterações
  - QR code para acessar online
- [ ] Usa pdfkit (já no package.json)
- **Owner**: Backend | **Tempo**: 3h | **Blocker**: Não

### ✅ AÇÃO 8: Botão "Exportar PDF" na Página de Lote
- [ ] Integrar GET `/ctm/parcels/:id/report`
- [ ] Botão na header de detalhes
- [ ] Download automático
- [ ] Loading state
- **Owner**: Frontend | **Tempo**: 1h | **Blocker**: Sim para AÇÃO 7

### ✅ AÇÃO 9: Validações de Negócio Críticas
- [ ] Validar SQLU único (por tenant/projeto)
- [ ] Validar inscrição imobiliária válida (format)
- [ ] Validar geometria (polygon válida, não vazia)
- [ ] Validar área > 0
- [ ] Mensagens de erro claras
- **Owner**: Backend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 10: Melhorar UX de Edição
- [ ] Confirmar alterações antes de save
- [ ] Toast de sucesso/erro
- [ ] Desabilitar save se validação falhar
- [ ] Mostrar campo com erro em vermelho
- [ ] Undo/reload se falhar
- **Owner**: Frontend | **Tempo**: 2h | **Blocker**: Não

---

## SEMANA 3 — Workflow + Integrações Básicas

### ✅ AÇÃO 11: Workflow de Aprovação para Lote
- [ ] Estados: PENDENTE → EM_VALIDACAO → APROVADA | REPROVADA
- [ ] Botões na página de detalhes: "Validar", "Aprovar", "Rejeitar"
- [ ] Rejeição com motivo (campo textarea)
- [ ] Histórico mostra transições
- [ ] Permissões por role (OPERADOR não aprova, GESTOR sim)
- **Owner**: Backend + Frontend | **Tempo**: 4h | **Blocker**: Não

### ✅ AÇÃO 12: Criar Rota de Listageme de Vistorias
- [ ] GET `/ctm/vistorias?parcelId=...`
- [ ] Listar vistorias de um lote (na página de detalhes)
- [ ] Mostrar: data, tipo, status, fotos count
- [ ] Link para abrir vistoria
- **Owner**: Backend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 13: Página de Detalhes de Vistoria
- [ ] Rota: `/app/ctm/vistorias/:id`
- [ ] Exibir: tipo, data, observações, fotos (gallery)
- [ ] Edição de observações (simples)
- [ ] Link para voltar ao lote
- **Owner**: Frontend | **Tempo**: 2h | **Blocker**: Sim para AÇÃO 12

### ✅ AÇÃO 14: Integração Básica com IPTU (Mock)
- [ ] Criar endpoint: GET `/integrations/iptu/parcel/:sqlu`
- [ ] Retorna mock: débito, última atualização, status
- [ ] Mostrar na página de lote (widget "Integração IPTU")
- [ ] Estrutura pronta para integração real depois
- **Owner**: Backend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 15: Melhorar Histórico de Alterações
- [ ] Mostrar quem fez a alteração (userId)
- [ ] Mostrar campos que mudaram (diff)
- [ ] Mostrar valores antes/depois
- [ ] Timestamp preciso
- **Owner**: Backend + Frontend | **Tempo**: 2h | **Blocker**: Não

---

## SEMANA 4 — Mobile Básico + Performance

### ✅ AÇÃO 16: Mobile-First Responsiveness
- [ ] Testar em mobile (375px viewport)
- [ ] Ajustar layout: 1-col no mobile
- [ ] Botões/inputs maiores (touch-friendly)
- [ ] Scroll horizontal em tabelas
- [ ] Menu hamburger em mobile
- **Owner**: Frontend | **Tempo**: 3h | **Blocker**: Não

### ✅ AÇÃO 17: Otimizar Performance de Busca
- [ ] Paginar resultados de busca (max 50)
- [ ] Debounce em search input (300ms)
- [ ] Cache de resultados (30s)
- [ ] Índices otimizados em MongoDB
- **Owner**: Backend + Frontend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 18: Implementar Erro Handling Robusto
- [ ] Catch de timeout (API demora > 10s)
- [ ] Retry automático com backoff (3 tentativas)
- [ ] Mensagem amigável para erro 500
- [ ] Log estruturado de erros (já tem Pino)
- **Owner**: Frontend | **Tempo**: 2h | **Blocker**: Não

### ✅ AÇÃO 19: Documentação de Usuário
- [ ] README de operação (como buscar, como editar)
- [ ] FAQ com problemas comuns
- [ ] Screenshots/GIF de fluxos principais
- [ ] Glossário de termos (SQLU, inscrição, etc)
- **Owner**: Product | **Tempo**: 3h | **Blocker**: Não

### ✅ AÇÃO 20: Preparar para Demo/PoC
- [ ] Script de testes (cenários de sucesso)
- [ ] Dados de teste realistas (lotes verdadeiros)
- [ ] Guia do apresentador (narrativa, fluxos)
- [ ] Contingency plan (se alguma função falhar)
- [ ] Checklist pré-demo (logs limpos, cache zerado)
- **Owner**: Product | **Tempo**: 4h | **Blocker**: Não

---

## QUADRO DE PRIORIZAÇÃO

| Ação | Sprint | Criticidade | Esforço | Owner | Blocker |
|------|--------|-------------|---------|-------|---------|
| 1-Teste | 1 | 🔴 | 1h | QA | - |
| 2-Form Vistoria | 1 | 🔴 | 2h | FE | 3 |
| 3-Endpoint Vistoria | 1 | 🔴 | 2h | BE | - |
| 4-Upload Foto | 1 | 🟡 | 3h | FE | - |
| 5-Menu | 1 | 🔴 | 2h | PD | - |
| 6-Dashboard Real | 2 | 🔴 | 3h | BE | - |
| 7-PDF | 2 | 🔴 | 3h | BE | - |
| 8-Botão PDF | 2 | 🔴 | 1h | FE | 7 |
| 9-Validações | 2 | 🟡 | 2h | BE | - |
| 10-UX Edição | 2 | 🟡 | 2h | FE | - |
| 11-Workflow | 3 | 🟡 | 4h | FE+BE | - |
| 12-List Vistorias | 3 | 🟡 | 2h | BE | - |
| 13-Detail Vistoria | 3 | 🟡 | 2h | FE | 12 |
| 14-IPTU Mock | 3 | 🟡 | 2h | BE | - |
| 15-Histórico | 3 | 🟡 | 2h | FE+BE | - |
| 16-Mobile | 4 | 🟡 | 3h | FE | - |
| 17-Performance | 4 | 🟡 | 2h | FE+BE | - |
| 18-Error Handling | 4 | 🟡 | 2h | FE | - |
| 19-Docs | 4 | 🟢 | 3h | PD | - |
| 20-Demo Prep | 4 | 🔴 | 4h | PD | - |

---

## VELOCIDADE ESTIMADA

### Sprint 1 (Semana 1)
- **Ações**: 1-5
- **Esforço**: ~10 horas
- **Outcome**: Vistoria funcional, navegação limpa
- **Deploy**: Staging + QA

### Sprint 2 (Semana 2)
- **Ações**: 6-10
- **Esforço**: ~10 horas
- **Outcome**: Dashboard real, Relatórios, Validações
- **Deploy**: Staging + Teste com usuário

### Sprint 3 (Semana 3)
- **Ações**: 11-15
- **Esforço**: ~12 horas
- **Outcome**: Workflow, Vistorias avançadas, IPTU
- **Deploy**: Staging + Prepare PoC

### Sprint 4 (Semana 4)
- **Ações**: 16-20
- **Esforço**: ~14 horas
- **Outcome**: Mobile, Performance, Documentação, Demo Ready
- **Deploy**: Production + Demo

---

## CRITÉRIOS DE SUCESSO

### Fim Sprint 1
- ✅ Busca funciona (AÇÃO 1)
- ✅ Vistoria criável (AÇÃO 2-4)
- ✅ Menu simplificado (AÇÃO 5)

### Fim Sprint 2
- ✅ Dashboard com dados reais (AÇÃO 6)
- ✅ Relatório PDF funciona (AÇÃO 7-8)
- ✅ Validações implementadas (AÇÃO 9)

### Fim Sprint 3
- ✅ Workflow de aprovação (AÇÃO 11)
- ✅ Integração IPTU mock (AÇÃO 14)
- ✅ Histórico completo (AÇÃO 15)

### Fim Sprint 4 (Demo Ready)
- ✅ Mobile responsivo (AÇÃO 16)
- ✅ Performance otimizada (AÇÃO 17)
- ✅ Error handling robusto (AÇÃO 18)
- ✅ Documentação completa (AÇÃO 19)
- ✅ Demo script pronto (AÇÃO 20)

---

## DEFINIÇÃO DE "PRONTO PARA DEMO"

Quando as 20 ações estiverem 80% completas:

- ✅ Busca de lote funciona
- ✅ Edição de lote funciona
- ✅ Relatório PDF funciona
- ✅ Vistoria funciona (básico)
- ✅ Dashboard com dados reais
- ✅ Navegação clara
- ✅ Mobile responsivo
- ✅ Zero crashes em cenários normais
- ✅ UX intuitiva
- ✅ Documentação básica

**Resultado**: Prefeito consegue em 30min: buscar lote → editar → gerar relatório → criar vistoria

---

## PRÓXIMAS ITERAÇÕES (Sprints 5-8)

Depois de "Demo Ready", focar em:
- [ ] Offline-first mobile
- [ ] Integração IPTU real
- [ ] Portal cidadão
- [ ] Análise geoespacial avançada
- [ ] Multi-tenant hardening
- [ ] Compliance/Auditoria
- [ ] Performance de 100k+ lotes
- [ ] API documentation

---

*Plano de 20 Ações Prioritárias — Pronto para Execução*
