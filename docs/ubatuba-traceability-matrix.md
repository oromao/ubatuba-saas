# Matriz de Rastreabilidade - Ubatuba / Geopixel

Status: viva, incremental.

Legenda:
- `OK` = já atende com evidência local e/ou pública
- `PARCIAL` = existe base funcional, mas falta cobertura, dado, integração ou UX
- `GAP` = requisito não atendido de forma comprovável
- `PENDENTE DE EVIDÊNCIA` = há menção pública, mas sem anexo/ato/documento confirmado

| Requisito | Fonte pública | Descrição objetiva | Módulo | Status atual do projeto | Gap | Prioridade | Ação técnica | Evidência de aceite |
|---|---|---|---|---|---|---|---|---|
| Plataforma 100% web | Geopixel Cidades / portal municipal | Operação web para equipe interna e cidadão | `apps/web` | OK | Nenhum crítico | P0 | Manter App Router + RBAC + sidebar por perfil | Login, dashboard, mapa, CTM, PGV, REURB acessíveis |
| Multiusuário e RBAC por perfil/secretaria | Geopixel governo digital / Ubatuba portal | Segregação por perfil, secretaria e tenant | `auth-rbac-audit` | OK | Falta mapa de secretarias mais granular | P0 | Expandir claims/roles por secretaria | Rotas protegidas, smoke de roles e tenant |
| Trilha de auditoria | Geopixel observatório / contratos públicos | Registro de ação por usuário e por processo | `auth-rbac-audit`, `reurb`, `surveys`, `ctm` | OK | Cobertura parcial em UI | P0 | Padronizar audit log e visualização | Eventos auditáveis em REURB e levantamento |
| Versionamento de registros críticos | CTM / REURB / processos | Histórico de alterações em imóveis, processos e documentos | `ctm`, `reurb`, `surveys` | PARCIAL | UI não expõe histórico de forma unificada | P0 | Criar timeline por entidade | Logs e status history persistidos |
| Armazenamento unificado de docs/imagens/plantas | Geopixel Cidades / contrato Ubatuba | Objetos, fotos, plantas e anexos em repositório único | `object-storage`, `surveys`, `reurb` | OK | Falta unificar UX de anexos | P0 | Consolidar attachments hub | Upload/complete/presign e downloads |
| Pesquisa global | Observatório municipal | Buscar por módulo, tela e item | `search-command` | PARCIAL | Falta busca por domínio/cadastro | P2 | Incluir imóveis, processos, chamados | Command palette funcional |
| Filtros avançados | CTM / PGV / monitoramento | Filtrar por bbox, status, classe, zona, núcleo | `ctm`, `pgv`, `map-features` | OK | Falta salvamento de filtros | P1 | Persistir filtros por perfil | Endpoints bbox/status funcionando |
| Histórico por imóvel/processo/chamado | CTM / 156 / processos | Linha do tempo operacional | `ctm`, `reurb`, `processes` | PARCIAL | Ainda fragmentado por módulo | P1 | Timeline comum de entidade | `statusHistory`, `auditLog` existentes |
| Dashboards configuráveis | Geopixel observatório | KPIs por secretaria/tema | `dashboard` | PARCIAL | Painel executivo ampliado, mas ainda sem edição de widgets | P1 | Tornar widgets configuráveis | `/dashboard/kpis` e `/dashboard/executive` operacionais |
| Relatórios exportáveis | CTM / PGV / REURB | CSV, XLSX, PDF, ZIP, GeoJSON | `pgv`, `reurb`, `exports` | OK | Falta catálogo unificado | P0 | Centralizar exports | Testes de export já existentes |
| Health checks e observabilidade mínima | Boas práticas SaaS | Health, logs e falhas visíveis | `health`, `logging` | OK | Falta dashboard operacional | P0 | Expor logs e métricas em UI | `/health` ok, logging documentado |
| Feature flags | Plataforma municipal moderna | Controlar módulos por tenant | `tenant-config`, `reurbEnabled` | PARCIAL | Não há painel de flags geral | P1 | Ampliar config por domínio | `reurbEnabled` funcionando |
| CTM imobiliário | Geopixel CTM / Ubatuba CTM | Parcelas, uso, enquadramento, discrepâncias | `ctm` | OK | UI de discrepâncias ainda limitada | P0 | Edição e histórico mais claros | `/ctm/parcels`, geojson, edições |
| CTM mobiliário e logradouros | CTM público | Cadastro complementar urbano | `ctm` | OK | Baixa densidade de demo data | P0 | Seed urbano litorâneo | `/ctm/logradouros`, `/ctm/urban-furniture` |
| Visualização cartográfica e CAD simplificado | Geopixel mapa / mobilidade em campo | Desenho, edição e camadas | `maps` | OK | Ajustes de layout e UX ainda em andamento | P0 | canvas fixado ao viewport | Mapa responde e não extravasa tela |
| Vínculo com zoneamento/plano diretor | PMDS / CTM | Relação imóvel x zoneamento x plano diretor | `pgv`, `ctm`, `zones` | PARCIAL | Sem UI consolidada de vínculo | P1 | Criar tela de enquadramento | `/pgv/zones`, `/pgv/faces` ok |
| Monit. alterações municipais | Geopixel monitoramento alterações | Alertas georreferenciados, triagem, fiscalização, evidência e desfecho | `alerts`, `monitoring` | PARCIAL | Falta ingestão automatizada e fonte externa | P1 | Pipeline operacional de tratativa | Alertas e geojson base existem |
| Mobilidade em campo online/offline | Mobilidade em campo | Coleta offline, GPS, mídia, assinatura | `mobile` | PARCIAL | PWA existe, offline ainda parcial | P1 | Aumentar sync e cache | `/mobile` disponível |
| Certidões e processos digitais | Geopixel processos/certidões | Emissão, validação, dossiê, consulta | `certificates`, `reurb`, `processes` | PARCIAL | Motor de certidão pública não consolidado | P1 | Criar domínio de certidões | Dossiês e PDFs já existem em partes |
| Certidões com validação pública | Portal municipal / atendimento 156 | Emissão de PDF, hash, código validador e consulta pública por tenant | `certificates` | OK | Falta interface de portal externo e template oficial | P0 | Consolidar templates e portal adapter | Endpoint público `validate` e emissão de PDF |
| Alvará digital de obras/habite-se | Geopixel alvará digital | Workflow, taxas, assinaturas, SLA | `permits-works` | GAP | Não há módulo completo | P1 | Criar domínio de licenciamento | Sem módulo dedicado hoje |
| Alvará digital de empresas | Geopixel alvará empresas | Abertura/encerramento e emissão | `permits-business` | GAP | Não há módulo completo | P1 | Criar domínio de empresas | Sem módulo dedicado hoje |
| PGV com simulação de cenários | Geopixel PGV | Cálculo e comparação de cenários | `pgv` | PARCIAL | Motor existe, UX de simulação limitada | P1 | Adicionar simulador e comparador | `/pgv/valuations` e fatores |
| Observatório municipal / mercado imobiliário | Geopixel observatório | Dashboards, comparação, arrecadação | `observatory-pgv` | PARCIAL | Painel executivo agora mostra consolidação por secretaria, mas falta camada analítica dedicada | P2 | Camada analítica | Dados de PGV e CTM disponíveis |
| Gestão e licenciamento ambiental | Geopixel ambiental | APP, poda, ativos, laudos, OS | `environment` | PARCIAL | Base de alertas existe, workflow não | P1 | Pipeline ambiental e OS | `alerts`, `environmentalalerts` |
| Monitoramento de eventos ambientais | Geopixel defesa civil | INMET/INPE/CEMADEN/sensores | `monitoring` | GAP | Integração externa ausente | P1 | Adapter de ingestão e alertas | Sem fonte externa conectada |
| Atendimento ao cidadão 156 | Geopixel 156 | Chamados, geolocalização, mapa e histórico | `citizen-156` | GAP | Não existe domínio dedicado | P1 | Criar chamadas + roteamento | Sem módulo hoje |
| Gestão de obras públicas | Geopixel obras públicas | Obra, etapa, medição, evidências | `public-works` | PARCIAL | Módulo funcional mínimo recém-criado | P2 | Evoluir mapa, indicadores e integração | API e UI operacionais com trilha e medições |
| Gestão de cemitério | Geopixel cemitério | Jazigos, proprietários e mapa | `cemetery` | PARCIAL | Módulo funcional mínimo recém-criado | P2 | Evoluir mapa, ocupação e integrações | API e UI operacionais com status e documentos |
| Portal cidadão coexistente | Ubatuba portal serviços | SSO/deep link e integração sem duplicar portal | `integration-hub` | PARCIAL | Estratégia ainda não formalizada | P0 | Adapters e deep links | Estrutura de roteamento pronta |
| Lógica multi-tenant | Contrato Ubatuba / CTM | Tudo amarrado a tenant e/ou slug | Core backend | OK | Algumas views ainda sem filtro explícito | P0 | Padronizar tenant guard | Tenant guard e headers existentes |
| Dados demo litorâneos de Ubatuba | Ubatuba público / operação local | Demo coerente com município litorâneo | Seed/mocks | PARCIAL | Falta completar cenários de secretaria | P0 | Enriquecer seed | Demo de mapa/levantamento já ativo |
| Helpdesk / suporte operacional | Contrato Ubatuba | Portal de operação assistida | `support`, `docs` | PENDENTE DE EVIDÊNCIA | Não há anexo público completo | P0 | Preparar tela e docs | Evidência documental pendente |
