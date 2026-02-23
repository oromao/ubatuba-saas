# E2E Data Strategy

## Objetivo
Garantir dados determinísticos, isolados por execução e com mínimo acoplamento entre cenários.

## Estratégia aplicada
- Identificadores únicos por execução (`runId`) em usuários, projetos e registros QA.
- Criação de dados via API no início das suites:
  - usuários e memberships de perfis
  - projeto QA
  - entidades CTM/PGV/surveys/integrações/cartas/compliance
- Isolamento por tenant através de `X-Tenant-Id` e JWT por perfil.

## Segurança e estabilidade
- Não foi criado endpoint destrutivo global de reset.
- Não há alteração de comportamento para produção.
- Dados de teste ficam confinados ao tenant demo/local.

## Limpeza
- Parte da limpeza é exercida por cenários de deleção administrativa (`admin_admin_only_deletes`).
- Como proteção contra regressão, o modelo principal é de dados efêmeros com `runId` (evita colisão entre execuções).

## Estratégia de autenticação de teste
- Smoke runner (`roles-smoke.spec.js`): login API e injeção de `storage` para reduzir tempo.
- Suites completas: login API + sessão UI limpa por perfil.

## Limitação conhecida
- Em ambientes headless sem contexto gráfico WebGL, checks de mapa podem falhar por infraestrutura (não por regra de negócio).
