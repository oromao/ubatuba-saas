# FlyDea Gap Audit for IA

Versao de referencia para reuso por IA, backlog e analise de maturidade do FlyDea Gestao de Municipio.

Fonte de evidencias:
- Inspecao de codigo do monorepo
- Login real no ambiente ativo em `http://172.233.188.166:3000`
- Validacao de sessao via API em `/auth/session`
- Navegacao real no browser para todos os itens visiveis do menu
- Validacao de responsividade em `integracoes` nos breakpoints `1024px` e `390px`
- Validacao de logout, refresh e back/forward apos sair
- Console real do browser com erro de runtime no mapa

## 1. Leitura executiva

O sistema esta funcional e em producao inicial, mas ainda nao transmite consistencia de suite municipal enterprise.

Sinais fortes de gap:
- Navegacao publica expoe `PoC`
- Login exige `tenantSlug` manual
- Sessao fica em `localStorage`
- Shell mistura produto real com linguagem de laboratorio
- Dashboard e mapa ainda parecem ferramentas tecnicas, nao superfice institucional pronta para licitacao
- Tabelas, filtros e estados vazios ainda sao basicos para operacao municipal intensa
- O mapa gerou erros reais de runtime no browser por configuracao invalida de layers

## 2. Gaps por severidade

### P0 criticos

#### G01 - Auth insegura no frontend
- Tipo: Risco tecnico frontend
- Evidencia: `apps/web/src/lib/auth.ts` salva `accessToken` e `refreshToken` em `localStorage`
- Impacto: superficie vulneravel a XSS e sessao fraca para padrao enterprise
- Causa provavel: implementacao SPA simples
- Correcao: migrar para cookie HttpOnly ou sessao segura equivalente

#### G02 - Rotas protegidas sem bloqueio duro percebido
- Tipo: Bug funcional
- Evidencia: browser novo acessa `/app/maps` e `/app/reurb` exibindo shell com `Tenant nao definido`
- Impacto: protecao pratica inconsistente; experiencia de acesso confusa
- Causa provavel: guard client-side e falta de enforcement de sessao no arranque
- Correcao: redirecionar/bloquear de forma deterministica no nivel de rota/sessao

#### G03 - PoC exposto ao usuario final
- Tipo: Problema de confianca institucional
- Evidencia: item `Documentação PoC` no menu
- Impacto: derruba percepcao comercial e institucional
- Causa provavel: area interna exposta no shell
- Correcao: remover da navegacao publica ou mover para area interna/admin

#### G04 - Tela PoC publica
- Tipo: Problema de confianca institucional
- Evidencia: rota `/app/poc` acessivel e explicitamente nomeada
- Impacto: reforca imagem de produto nao finalizado
- Causa provavel: feature de validacao virou feature de produto
- Correcao: ocultar/reclassificar a area

### P1 altos

#### G05 - Login com tenant manual
- Tipo: Gap de UX
- Evidencia: formulario exige `tenantSlug` digitado
- Impacto: atrito alto para usuario institucional
- Causa provavel: fluxo pensado para operador tecnico
- Correcao: tenant selector, ajuda contextual ou autoidentificacao

#### G06 - Metrics visuais nao confiaveis no login
- Tipo: Gap de confiança institucional
- Evidencia: cards com `64`, `12`, `284`, `1.4k` estaticos
- Impacto: parece dado inventado/fake
- Causa provavel: copy de marketing sem lastro
- Correcao: remover ou ligar a dados reais

#### G07 - Tenant exibido como ID cru
- Tipo: Gap de UX
- Evidencia: sidebar/topbar mostram `Tenant: 69de...`
- Impacto: visual tecnico e pouco institucional
- Causa provavel: exposicao direta do identificador interno
- Correcao: mostrar nome amigavel da prefeitura/tenant

#### G08 - Dashboard mostra IDs literais de widget
- Tipo: Gap de UX
- Evidencia: `summary`, `secretarias`, `priorities`, `satelliteHealth`
- Impacto: tela parece ferramenta de dev/admin
- Causa provavel: ausencia de registry semantico
- Correcao: mapear widget id para label, icone, descricao e permissao

#### G09 - Mapa com acabamento tecnico demais
- Tipo: Gap de UI
- Evidencia: `maps/map-view.tsx` + `MapToolbar` + `MapLayers` com visual ad hoc
- Impacto: reduz percepcao enterprise
- Causa provavel: componente fora do design system principal
- Correcao: padronizar surfaces, densidade e estados

#### G10 - Mapa sem fallback de erro/retry
- Tipo: Gap de feedback visual
- Evidencia: console do browser com erros `unknown property` repetidos em propriedades de layers do MapLibre
- Impacto: falhas podem virar tela silenciosa e o mapa pode se comportar de forma instavel
- Causa provavel: configuracao de estilo/camadas incorreta
- Correcao: error overlay, retry e validacao do schema de layers antes de renderizar

#### G11 - DataTable muito basica para operacao municipal
- Tipo: Gap de UX
- Evidencia: sorting/paginacao existem, mas nao ha search/filtros nativos
- Impacto: listas grandes ficam lentas de operar
- Causa provavel: componente base minimalista
- Correcao: search, filter chips, empty actions e densidade controlada

#### G12 - Ordenacao sem semantica a11y forte
- Tipo: Problema de acessibilidade
- Evidencia: header clicavel sem `aria-sort` explicito
- Impacto: teclado/screen reader ficam piores
- Causa provavel: implementacao simplificada
- Correcao: adicionar `aria-sort`, foco visivel e hints

#### G13 - Inputs livres demais em dominios fechados
- Tipo: Gap de UX
- Evidencia: 156, ambiental, monitoramento e reurb usam muitos textos livres para campos com dominio previsivel
- Impacto: aumenta erro e inconsistencias
- Causa provavel: formularios feitos rapido
- Correcao: trocar por select, autocomplete ou enum chips

#### G14 - Empty states genericos
- Tipo: Gap de UX
- Evidencia: tabelas vazias dizem apenas que nao ha dados
- Impacto: usuario fica sem proximo passo
- Causa provavel: ausencia de padrao de empty state
- Correcao: CTA contextual por modulo

#### G15 - Bug de runtime no mapa
- Tipo: Bug funcional
- Evidencia: console com muitos erros de `unknown property` para `line-color`, `line-width`, `line-opacity`, `circle-color`, `circle-radius`, `fill-color` e `fill-opacity`
- Impacto: mapa perde confiabilidade e passa sensacao de tela quebrada
- Causa provavel: objeto de estilo de layer incompativel com MapLibre
- Correcao: corrigir o schema dos layers e adicionar validacao de runtime

#### G16 - Acoes criticas sem confirmacao contextual
- Tipo: Gap de UX
- Evidencia: fluxos de status em 156/ambiental fazem transicao direta
- Impacto: risco de erro operacional
- Causa provavel: fluxo sem etapa de confirmacao
- Correcao: dialog contextual antes de transicoes sensiveis

### P2 medios

#### G17 - Design system com vazamento visual
- Tipo: Inconsistencia de design system
- Evidencia: uso misto de tokens e cores hardcoded em mapa/observatorio
- Impacto: aparência heterogenea
- Causa provavel: padrao visual incompleto
- Correcao: normalizar tokens, surfaces e spacing

#### G18 - Observatorio usa reload como aplicar
- Tipo: Gap de UX
- Evidencia: botao `Aplicar` recarrega a pagina
- Impacto: quebra previsibilidade
- Causa provavel: atalho de implementacao
- Correcao: refetch reativo sem reload

#### G19 - Busca oculta no mobile
- Tipo: Problema de responsividade
- Evidencia: topbar mostra busca apenas em `md+`
- Impacto: navegação menos eficiente em campo
- Causa provavel: priorizacao desktop
- Correcao: buscar via drawer/command palette no mobile

#### G20 - Badge de notificacao sem lastro visivel
- Tipo: Problema de confianca institucional
- Evidencia: ponto visual fixo no sino
- Impacto: parece fake se nao houver contagem real
- Causa provavel: sinal estetico sem dados
- Correcao: conectar a dados reais ou remover

#### G21 - Login em duas colunas pesado para telas pequenas
- Tipo: Problema de responsividade
- Evidencia: hero + formulario ocupam layout amplo
- Impacto: leitura e foco pioram em 390-430px
- Causa provavel: layout desktop-first
- Correcao: compactar hero e priorizar formulario

#### G22 - Mapa e paineis absolutos ruins em telas pequenas
- Tipo: Problema de responsividade
- Evidencia: painel lateral/toolbar flutuante no mapa
- Impacto: sobreposicao e baixa ergonomia
- Causa provavel: estrutura absoluta sem breakpoints fortes
- Correcao: drawers e compactacao por breakpoint

#### G23 - Repeticao de componentes sem primitives de dominio
- Tipo: Duplicacao / divida tecnica frontend
- Evidencia: card, badge, input e status aparecem repetidos entre modulos
- Impacto: custo de manutencao e regressao sobe
- Causa provavel: ausencia de primitives de dominio
- Correcao: extrair KPI card, status row, entity header, action rail

#### G24 - Padrao de acessibilidade incompleto em formularios
- Tipo: Problema de acessibilidade
- Evidencia: labels existem, mas help/error semantics nao estao padronizados
- Impacto: clareza parcial para teclado e screen reader
- Causa provavel: falta de guideline unico
- Correcao: padronizar `label`, `aria-describedby` e mensagens de erro

### P3 baixos

#### G25 - Shell ainda parece tecnico demais
- Tipo: Problema de confianca institucional
- Evidencia: linguagem e densidade visual ainda lembram painel interno
- Impacto: reduz acabamento premium
- Causa provavel: copy e IA nao alinhadas a contexto municipal
- Correcao: reescrever mensagens e densidade para governanca publica

#### G26 - Estrutura de widgets pode escalar mal
- Tipo: Divida tecnica de frontend
- Evidencia: layout configuravel controlado por ids e estado local
- Impacto: dificuldade de crescimento e manutencao
- Causa provavel: registry semantico ausente
- Correcao: registry com metadados de negocio

## 3. Gaps por area

### Navegacao e arquitetura da informacao
- PoC exposto ao usuario final
- Menu mistura jornada real com prova tecnica
- Nomenclatura ainda fala com operador tecnico
- Todas as rotas visiveis do menu foram abertas no browser e existem de fato
- O menu principal esta navegavel, mas precisa higienizacao para licitacao/demo

### Dashboard
- Widgets com IDs literais
- Hierarquia executiva precisa de mais curadoria
- Melhorar empty/error/retry states
- Login real leva ao dashboard corretamente
- Logout e retorno ao login funcionaram no browser

### Mapa e camadas
- Acabamento tecnico e pouco institucional
- Falta fallback robusto de erro
- Layout ainda desktop-first
- Este e o modulo com bug real mais forte validado no browser
- Console registrou erros repetidos de schema invalido nas layers

### Tabelas e filtros
- Componente base util, mas simples
- Falta busca e filtros nativos
- A11y de ordenacao incompleta
- 156, CTM, PGV, processos e outros modulos renderizam tabelas/listas, mas sem esgotar interacao profunda em todos os casos

### Formularios e CRUD
- Muitos campos livres onde o dominio e fechado
- Falta confirmacao contextual
- Empty states pouco acionaveis
- O formulario de login foi validado no browser com sucesso
- O fluxo de 156 mostrou formulario real e listagem, mas CRUD completo continua parcialmente testado

### Feedback visual
- Indicadores e badges nem sempre tem lastro real
- Estados de sucesso/erro nao seguem padrao unico
- Loading/erro/retry nao estao uniformes
- O mapa mostrou que feedback de erro precisa ser reforcado com maior prioridade

### Estados vazios/loading/erro
- Empty states genericos
- Faltam CTAs claros
- Falta protecao visual forte em falhas de integracao
- Algumas telas abriram com conteudo util, outras dependem de contexto/dados e precisam de testes adicionais

### Responsividade
- Login pesado em telas pequenas
- Mapa e paineis absolutos podem quebrar ergonomia
- Shell ainda prioriza desktop
- `Integracoes` permaneceu legivel em `1024px` e `390px`
- A interface converteu o menu para hamburger no mobile e ficou usavel

### Mobile
- Busca escondida
- Sidebar existe, mas a operacao completa nao e mobile-first
- Fluxos de campo precisam de densidade menor
- A validacao mobile mais forte foi em `Integracoes`; os demais modulos ainda precisam de cobertura igual de profunda

### Acessibilidade
- Ordenacao da tabela precisa de semantica melhor
- Focus/help/error ainda nao estao padronizados
- Controles complexos precisam melhor estrutura
- A11y por teclado e screen reader nao foi esgotada nesta sessao

### Design system
- Vazamento de cores hardcoded
- Shell e modulos nao compartilham a mesma densidade visual
- Primitives de dominio faltam
- O shell tem base consistente, mas mapa e dashboard destoam do restante

### Robustez frontend
- Auth em `localStorage`
- Rotas protegidas ainda sao muito dependentes de estado client-side
- Dashboard configuravel sem registry semantico
- Logout limpou a sessao corretamente no browser
- Ainda assim a camada de sessao nao atende o padrao enterprise esperado

### Percepcao institucional/comercial
- Sinais de PoC/lab expostos
- Login e shell nao passam ainda sensacao de suite municipal enterprise
- Mapa e dashboard precisam mais acabamento e previsibilidade
- `Integracoes` e a tela mais forte em prontidao institucional entre as validadas
- O mapa e a maior quebra de confianca por bug real

## 4. Gaps nao validados

Estes pontos precisam de verificacao adicional em dados reais, volume real ou interacao mais longa:
- performance com dataset grande
- responsividade completa em 768/430/390 com screenshot em todos os modulos
- a11y por screen reader e teclado em todas as paginas
- CRUD completo em todos os modulos
- upload real em fluxos de documento e evidencia
- expirar sessao e validar refresh posterior
- interacao profunda de REURB, CTM, PGV, processos e cartas

## 5. Prioridade recomendada

Ordem sugerida de resolucao:
1. Seguranca de sessao
2. Bloqueio duro de rotas protegidas
3. Remocao de PoC da superficie publica
4. Login com tenant assistido
5. Correcao do mapa e validacao das layers
6. Registry semantico do dashboard
7. Fallback de erro/retry no mapa
8. Evolucao da DataTable
9. Padronizacao de responsividade e design system
10. A11y baseline
11. Extracao de primitives de dominio

## 6. Uso por IA

Este documento pode ser usado como:
- base para backlog
- prompt de auditoria continuada
- contexto para priorizacao de sprint
- input para agentes de UX/UI, frontend e QA
- matriz de gaps para acompanhamento de maturidade

## 7. Fechamento do browser audit

Cobertura real validada no browser:
- login com credenciais fornecidas
- logout
- refresh/back apos logout
- abertura de todas as rotas visiveis no menu
- responsividade em `integracoes` nos breakpoints `1024px` e `390px`
- confirmacao de que `integracoes` e a tela mais institucional entre as validadas
- confirmacao de que o mapa tem bug real de runtime

Rotas abertas no browser nesta passada:
- `/app/dashboard`
- `/app/observatorio`
- `/app/maps`
- `/app/ctm/parcelas`
- `/app/ctm/logradouros`
- `/app/ctm/mobiliario`
- `/app/pgv/zonas`
- `/app/pgv/faces`
- `/app/pgv/fatores`
- `/app/pgv/relatorio`
- `/app/reurb`
- `/app/processes`
- `/app/monitoramento`
- `/app/156`
- `/app/cartas`
- `/app/modulos/obras`
- `/app/modulos/empresas`
- `/app/ambiental`
- `/app/integracoes`
- `/app/poc`

Limites desta sessao:
- CRUD completo, uploads reais e teclado/screen reader continuam nao totalmente validados
- `REURB`, `CTM`, `PGV`, `processes` e `cartas` foram abertos, mas seguem como cobertura parcial
- o mapa e o principal bug funcional confirmado

## 8. Consolidacao dos problemas confirmados no browser

### 8.1 Problemas confirmados

#### P0
- PoC exposto na navegacao publica
- rota `/app/poc` publica e nomeada como prova tecnica
- auth com tokens em `localStorage`
- mapa com erro real de runtime por layers invalidas

#### P1
- login com tenant manual
- hero do login com metricas estaticas
- tenant exibido como ID cru
- dashboard com widgets por IDs literais
- mapa com acabamento tecnico demais
- mapa sem fallback de erro/retry visivel
- DataTable base simplista para operacao municipal
- ordenacao de tabela com semantica a11y incompleta
- inputs livres demais em dominios fechados
- empty states genericos
- acoes criticas sem confirmacao contextual
- design system com vazamento visual
- busca escondida no mobile
- badge de notificacao sem lastro real
- login pesado em telas pequenas
- mapa e paineis absolutos ruins em telas pequenas

#### P2
- observatorio usando reload como aplicar
- repeticao de componentes sem primitives de dominio
- padrao de acessibilidade incompleto em formularios
- shell ainda tecnico demais
- estrutura de widgets pode escalar mal

### 8.2 Itens parciais
- cobertura parcial de REURB, CTM, PGV, processos e cartas
- cobertura parcial de CRUD, upload e a11y profunda
- `dashboard` validado, mas ainda precisa de leitura mais profunda de widgets e utilidade real
- `156` validado, mas ainda precisa de UX e feedback melhores
- `integracoes` validado com sucesso e e a melhor tela institucional entre as testadas

### 8.3 Itens nao validados
- CRUD completo em todos os modulos
- upload real em fluxos de documento e evidencia
- teclado e screen reader em todas as paginas
- expirar sessao e validar recuperacao
- breakpoint 768/430/390 em todos os modulos
- interacao profunda com camadas GIS reais

### 8.4 Classificacao funcional dos principais blocos
- `integracoes`: manter, porque e a tela mais clara em prontidao institucional entre as validadas
- `dashboard`: manter, mas simplificar e dar semantica aos widgets
- `mapa`: reconstruir/corrigir urgentemente
- `156`: manter, mas com melhor UX e feedback
- `REURB`, `CTM`, `PGV`, `processes`, `cartas`: manter por enquanto, mas ainda estao como cobertura parcial e precisam de validacao profunda

### 8.5 Resumo operacional
- O sistema nao esta quebrado de forma global, mas tem um bug grave de mapa e varios sinais de produto ainda nao higienizado para prefeitura/licitacao.
- A maior prioridade continua sendo: corrigir o mapa, remover PoC da superficie publica, endurecer sessao e reduzir friccao de entrada.

## 9. Backlog curto e pronto para IA

### Sprint 1
- Remover `PoC` da navegação publica
- Ocultar ou reclassificar a rota `/app/poc`
- Corrigir o schema das layers do mapa
- Migrar auth para sessao segura
- Reduzir friccao do tenant no login

### Sprint 2
- Criar registry semantico de widgets
- Evoluir DataTable com search, filtros e a11y melhor
- Adicionar fallback de erro/retry no mapa
- Trocar inputs livres por controles fechados
- Padronizar empty states e confirmacoes

### Sprint 3
- Normalizar design system e densidade visual
- Reestruturar responsividade do mapa e dos painéis
- Extrair primitives de dominio
- Fechar a11y de formulários e tabelas
- Simplificar widgets fracos ou redundantes

## 10. Fonte rapida para IA

Se for reaproveitar este documento em outra IA, os problemas prioritarios sao:
1. PoC exposto publicamente
2. mapa quebrando com erro de runtime
3. auth insegura em `localStorage`
4. login com tenant manual
5. dashboard com widgets tecnicos demais
6. responsividade fraca em mapa e login
7. tabelas/formularios basicos demais para operacao municipal
8. a11y ainda incompleta
9. cobertura parcial de REURB/CTM/PGV/processos
10. shell ainda com sinais de laboratorio
