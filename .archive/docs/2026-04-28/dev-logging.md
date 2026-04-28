# Logging de Desenvolvimento (Backend + Frontend)

## Objetivo
Mostrar somente logs relevantes no modo dev, com formato consistente e contexto para debug rapido.

## Backend (API)

### O que foi aplicado
- Logs estruturados com `pino`.
- Log HTTP com foco em erro por padrao.
- Campos relevantes: `method`, `path`, `statusCode`, `durationMs`, `correlationId`, `tenantId`, `userId`.
- Excecoes HTTP registradas com contexto e stack para `5xx`.

### Variaveis uteis
- `LOG_LEVEL=info|warn|error|debug`
- `LOG_HTTP_ALL=true|false`
  - `false` (padrao): loga somente requests `>= 400`.
  - `true`: loga todas as requests.

### Exemplo recomendado (dev)
- `LOG_LEVEL=info`
- `LOG_HTTP_ALL=false`

## Frontend (Web)

### O que foi aplicado
- Logger central em `apps/web/src/lib/logger.ts`.
- `apiFetch` agora loga erro util com:
  - `path`, `method`, `status`, `correlationId`, `detail`.
- Erros de mapa (MapLibre/WebGL) saem como `warn` estruturado, evitando ruido de stack irrelevante.

### Variaveis uteis
- `NEXT_PUBLIC_DEV_LOGS=true|false`
- `NEXT_PUBLIC_LOG_LEVEL=debug|info|warn|error`

### Exemplo recomendado (dev)
- `NEXT_PUBLIC_DEV_LOGS=true`
- `NEXT_PUBLIC_LOG_LEVEL=warn`

## Leitura rapida de erro (fluxo)
1. Veja erro no frontend (`path`, `status`, `correlationId`).
2. Procure o mesmo `correlationId` no backend.
3. Leia `http_exception` ou `http_request` correspondente.
4. Corrija input/config e repita.
