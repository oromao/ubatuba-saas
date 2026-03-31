# Projeto FlyDea - Central Node para Inteligência Artificial (AGENTS)
**Versão:** 1.0.0
**Missão:** SaaS de GeoInteligência Municipal e Governança Territorial (Ubatuba CE 24/2025).

Esta é a FONTE DE VERDADE para todos os Agentes de IA que operam neste monorepo (Claude, Codex, Antigravity, etc). Todo comportamento de código gerado deve obedecer rigorosamente às políticas descritas aqui.

---
## 1. Visão Geral da Arquitetura (Monorepo)
- **Frontend (apps/web):** Next.js 14+ (App Router), TailwindCSS, MapLibre, Zustand, shadcn-ui.
- **Backend (apps/api):** NestJS, MongoDB (Mongoose), JWT Guarded, RBAC dinâmico.
- **Infra (infra/):** Docker Compose (Local Stack), MinIO (Storage), GeoServer (GIS), QGIS/Mocks.

---
## 2. Direitos Irrevogáveis (Não Quebrar)
1. **MULTI-TENANT:** 
   * Nenhum módulo pode assumir dados globais. 
   * Todo dado deve ser persistido e consultado atrelado a um `tenantContext` e/ou `slug`.
2. **RBAC & AUDITORIA:** 
   * Modificadores de dados (`Create`, `Update`, `Delete`) exigem rastreabilidade rigorosa.
   * `x-lgpd-purpose` é mandatório em áreas contendo Dados Sensíveis/PII (ex: REURB-S). Não bypassie essa checagem.
3. **MÓDULO CTM & PGV:**
   * Lógica geoespacial crítica. Não altere geometrias sem entender o impacto no GeoServer/MapLibre.
4. **DOMÍNIO REURB-S:**
   * Fluxos E2E intocáveis sem evidência de validação (Cadastro Família -> Mapeamento -> Dossiê -> Certificação -> CRF).
   * Todo novo campo requer suporte em \`Exportações/CSV/XLSX/ZIP\`.

---
## 3. Protocolo de Ações (Obrigatório antes de codar)
- **Modificar Frontend:** Consulte os tokens de CSS antigos, analise a integridade de Layout e identifique componentes compartilhados (\`apps/web/src/components/\`). Sempre projete UI mobile-ready e Dark Mode support.
- **Modificar Backend:** O design deve usar Services puros (Injeção de dependência). Sempre cubra mudanças com Decorators DTO (class-validator) e testes essenciais do módulo.
- **Modificar Geodados (GIS):** Consulte a estrutura BBOX e os schemas GeoJSON em \`.agents/skills/geojson-contract-check.md\`.
- **Alterar Infra:** Validação mandatória no Docker local antes de sinalizar completion (`docker-local-stack-debug.md`).

---
## 4. Política de Handoff (Transferência de Contexto)
Em projetos de múltiplos agentes (ex: Antigravity preparando a base e o desenvolvedor executando front-end no Cursor), registre o último estado no arquivo `docs/agents/handoff.md`. Siga o modelo `templates/agents/handoff-template.md`.\n