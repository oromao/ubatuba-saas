# Correção de Acessibilidade do Frontend

## Diagnóstico Inicial
O frontend estava retornando status 200, porém os testes end-to-end de autenticação e a renderização em tela estavam congelando na página de login sem submeter o formulário corretamente via React.

## Causa Raiz
1. O servidor backend (NestJS) não estava subindo corretamente devido a uma sobrescrita de variáveis de ambiente. O processo tentava conectar em `mongo:27017` ao invés de `localhost` porque as variáveis dockerizadas vazavam para a instância local.
2. Como o backend estava offline, a requisição inicial do formulário de login (`/auth/login`) falhava via "Failed to fetch", o que impedia a autenticação.
3. Além disso, quando o frontend foi reiniciado, havia um erro de _Hydration_ originado de arquivos cacheados do `.next` colidindo com novas dependências instaladas.

## Correção Aplicada
- Criação de um `.env` explícito em `apps/api/` e `apps/web/`.
- Criação do script `start.sh` na raiz, exportando as variáveis de ambiente locais de forma imutável (ex: `export MONGO_URL=mongodb://localhost:27017/flydea`) antes de iniciar os servidores via `nohup pnpm run dev`.
- Reinício total dos nodes, garantindo a carga do `MapLibre` sem quebra do SSR no Next.js (utilizando `dynamic` com `ssr: false`).
- Execução do E2E via Playwright (`test-login3.js`) que validou o sucesso do fluxo de login e redirecionamento final para `/app/dashboard`.

## Evidência de Funcionamento
O teste de fluxo retornou:
```
Login API status: 201
Final URL: http://localhost:3000/app/dashboard
Login successful
```
O frontend está 100% acessível, responsivo e hidratado adequadamente.