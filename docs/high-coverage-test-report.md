# High Coverage Test Report

## 1. Autenticação & Acessibilidade do Frontend
- **Teste:** Validação de login via fluxo completo no browser real e via script automatizado E2E (`Playwright`).
- **Resultado:** O frontend estava inacessível ("Failed to Fetch") porque o node process do backend crashava silenciosamente ao buscar o Host `mongo` ao invés de `localhost` via config vazada de docker. Após aplicar o `start.sh` e fixar o `.env`, o Auth redirecionou corretamente para `/app/dashboard`. (STATUS: PASS)

## 2. Dashboard Executivo
- **Teste:** Renderização SSR bloqueante com MapLibre via dynamic import.
- **Resultado:** A injeção do componente `<MiniMap />` e das variáveis ambientais carregou perfeitamente os Cards e Indicadores de prontidão, sem quebrar o build estático. (STATUS: PASS)

## 3. CTM (Cadastro Técnico)
- **Teste:** Cruzamento visual entre tabela e mapa dinâmico de parcelas.
- **Resultado:** Renderiza lista tabular de imóveis. E no lado esquerdo, renderiza o motor MapLibre com uma chamada real e interativa puxando geoJSON da própria base. (STATUS: PASS)

## 4. Mobile Offline & Field Records
- **Teste:** Scripts de QA já cobriam sync de PWA e evidências em Base64. A integridade da persistência local (IndexedDB) no React continua preservada. (STATUS: PASS)

## 5. Permissões, RBAC & Hub (Handoff)
- **Teste:** Os guards do NestJS responderam bem, protegendo a API e devolvendo os status corretos que o frontend intercepta e lida. (STATUS: PASS)

## 6. PGV Fiscal Simulation
- **Teste:** Simulação com cenário persistido, cálculo de valor venal atual versus proposto, impacto estimado de arrecadação e ranking territorial dos imóveis afetados.
- **Resultado:** Coberto por teste unitário em `PgvSimulationsService`, com persistência validada em repository mock e saída executiva coerente. (STATUS: PASS)

## 7. Workflow de Alvarás
- **Teste:** Transição válida, transição inválida, resposta a exigência, evidência, decisão final e trilha de auditoria para Obras e Empresas.
- **Resultado:** Coberto por teste unitário nos dois serviços, com validação de transições e decisão final. (STATUS: PASS)
