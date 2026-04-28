# Integracao de IdP Municipal

Este documento explica como conectar o FlyDea a um IdP municipal sem quebrar o modelo multi-tenant.

## 1. Objetivo
Permitir:
- login institucional
- handoff entre portal e FlyDea
- contexto de tenant preservado
- auditoria de acesso
- experiencia consistente em desktop e mobile

## 2. Fluxos suportados hoje

### Handoff assinado
Endpoint:
- `POST /auth/portal/exchange`

Uso:
- o portal gera um token assinado
- o FlyDea valida assinatura e expiracao
- o usuario recebe sessao local no FlyDea

### OIDC de homologacao
Endpoints:
- `POST /auth/oidc/authorize`
- `POST /auth/oidc/callback`

Uso:
- o portal monta a url de autorizacao
- o callback troca o code por sessao
- o fluxo simula coexistencia com IdP real

## 3. Variaveis de ambiente relevantes

### No FlyDea
- `WEB_URL`
- `API_URL`
- `JWT_SECRET`
- `PORTAL_LINK_SECRET`
- `OIDC_SHARED_SECRET`

### No portal municipal
- URL de callback autorizada
- segredo de troca
- tenant padrao
- mapeamento de perfil para role

## 4. Configuracao minima recomendada

1. Registrar o FlyDea como cliente no IdP.
2. Definir redirect URI para:
   - `/portal/oidc/callback`
3. Definir politica de logout.
4. Mapear perfis:
   - `ADMIN`
   - `GESTOR`
   - `OPERADOR`
   - `LEITOR`
5. Validar expurgo e expiracao do token.

## 5. Exemplo de fluxo do portal

1. Usuario autentica no portal municipal.
2. O portal chama `POST /integration-hub/oidc-link`.
3. O portal redireciona para o `href` retornado.
4. O navegador abre `/portal/oidc/start`.
5. O callback conclui o handoff.
6. O usuario cai no dashboard ou na rota de destino.

## 6. Pontos de seguranca

- sempre validar `tenantSlug`
- sempre validar expiracao
- sempre registrar `state`
- nao reutilizar token assinado
- nao expor segredo em front-end
- manter auditoria de eventos de autenticacao

## 7. O que ainda nao e federacao completa

Isto ainda nao substitui:
- SAML production-grade
- OIDC enterprise com discovery/metadata e refresh policy madura
- governanca de ciclo de vida de conta em IdP externo

## 8. Como vender corretamente

Nao diga:
- "integra com qualquer IdP sem ajuste"

Diga:
- "possui handoff institucional OIDC-ready"
- "suporta coexistencia com portal municipal"
- "esta pronto para federacao com IdP da prefeitura mediante cadastro do cliente e politica de callback"

