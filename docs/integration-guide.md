# Guia de Integracoes FlyDea

Este guia explica como ligar o FlyDea a portais, ERP tributario, IdP municipal e fluxos de homologacao.

## 1. Principio de integracao
O FlyDea foi desenhado para coexistir com o ecossistema da prefeitura, nao para substituir tudo de uma vez.

Use tres caminhos:
- `DEEPLINK` para abrir telas internas do FlyDea a partir de um portal externo
- `API` para sincronizar dados, validar certidoes e consultar status
- `SSO/OIDC` para handoff institucional com identidade compartilhada

## 2. Estrutura basica

### Rotas de integracao
- `GET /integration-hub/adapters`
- `GET /integration-hub/portal-links`
- `POST /integration-hub/portal-link`
- `POST /integration-hub/oidc-link`

### Rotas de autenticacao
- `POST /auth/login`
- `POST /auth/portal/exchange`
- `POST /auth/oidc/authorize`
- `POST /auth/oidc/callback`
- `GET /auth/institutional-readiness`
- `GET /auth/session`

## 3. Como integrar um portal municipal

### Opcao A: deep link simples
Use quando o portal so precisa abrir uma pagina interna do FlyDea.

Exemplo:
```bash
curl -X GET "http://localhost:4000/integration-hub/portal-links?projectId=<PROJECT_ID>" \
  -H "x-tenant-id: demo"
```

O retorno traz links como:
- certidoes
- processos
- mobile
- portal oidc homologacao

### Opcao B: portal link assinado
Use quando o portal precisa mandar o usuario para o FlyDea com sessao de handoff.

1. O portal chama:
```bash
curl -X POST "http://localhost:4000/integration-hub/portal-link" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: demo" \
  -d '{
    "email": "admin@demo.local",
    "tenantSlug": "demo",
    "roleHint": "GESTOR",
    "target": "/app/dashboard",
    "context": {
      "department": "Gabinete",
      "source": "portal-municipal"
    }
  }'
```

2. O backend devolve `href`.
3. O navegador abre o `href`.
4. O FlyDea troca o token assinado por sessao em `POST /auth/portal/exchange`.

### Opcao C: OIDC homologacao
Use quando a prefeitura quer simular o fluxo de identidade institucional.

1. O portal abre:
```bash
curl -X POST "http://localhost:4000/auth/oidc/authorize" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "demo",
    "email": "admin@demo.local",
    "roleHint": "CIDADAO",
    "department": "Portal Cidadao",
    "next": "/app/dashboard",
    "state": "demo"
  }'
```

2. O FlyDea devolve `href`.
3. O usuario passa pela pagina `/portal/oidc/start`.
4. O callback consome o `code` em `/portal/oidc/callback`.

## 4. Como integrar com ERP tributario

O hub de integracao ja expõe o espaço para conectores e sincronizacao tributaria.

Fluxo recomendado:
1. Criar conector em `POST /tax-integration/connectors`
2. Testar conexao em `POST /tax-integration/connectors/:id/test`
3. Rodar sincronizacao em `POST /tax-integration/connectors/:id/sync`
4. Ler logs em `GET /tax-integration/connectors/:id/logs`

Boas praticas:
- sempre passar `projectId`
- manter `tenantId` consistente
- registrar logs de erro e resposta
- mapear previamente campos do cadastro municipal

## 5. Como integrar o IdP municipal

### O que o FlyDea ja faz
- cria fluxo OIDC de homologacao
- aceita portal exchange assinado
- expõe leitura de contexto de sessao
- rastreia eventos de login/handoff

### O que ainda precisa existir fora do FlyDea
- cliente OIDC registrado no IdP
- redirect URIs autorizadas
- segredo compartilhado ou exchange formal
- politica de refresh/sessao definida com a prefeitura
- opcional: federacao SAML, se a prefeitura exigir

### Parametros tipicos
- `tenantSlug`
- `email`
- `roleHint`
- `department`
- `redirectUri`
- `next`
- `state`

### Exemplo de homologacao
1. Configurar `WEB_URL` do FlyDea.
2. Configurar `OIDC_SHARED_SECRET` e/ou `PORTAL_LINK_SECRET`.
3. Registrar o redirect do callback.
4. Abrir `/portal/oidc/start?tenantSlug=demo&email=admin@demo.local`.
5. Validar o retorno em `/portal/oidc/callback`.

## 6. Como validar que a integracao ficou boa

Checklist objetivo:
- login abre e cria sessao
- tenant fica amarrado ao token
- `GET /auth/session` devolve contexto valido
- portal link assinado funciona
- OIDC homologado funciona
- mobile abre no navegador e no celular
- certidao valida publicamente
- alvara tem historico e decisao

## 7. Regra de ouro para banca e edital
Nao prometa federacao real se tudo que existe for homologacao.
Venda assim:
- coexistencia institucional
- handoff seguro
- RFBAC + tenant isolado
- fluxo pronto para integracao com IdP municipal

