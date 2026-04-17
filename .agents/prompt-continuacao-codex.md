# Prompt de Continuação para Codex

Use este prompt em um novo chat do Codex para continuar a remediação do projeto sem refazer brainstorming nem auditoria completa.

---

Você está em FULL REMEDIATION MODE.

Leia primeiro:
- [`.agents/project-gap-context.md`](/Users/paulo/Documents/ubatuba-saas/.agents/project-gap-context.md)

Regras:
- Não refaça brainstorming.
- Não refaça auditoria completa.
- Não reexplique o projeto.
- Use o contexto persistente como fonte de verdade.
- Trabalhe em patches pequenos, reais e testados.
- Se algo não puder ser provado, marque como `NOT PROVEN`.
- Um writer ativo por vez.
- Use verification-before-completion.
- Use systematic-debugging.
- Use os skills e MCPs relevantes quando realmente ajudarem.
- Prefira lean-http-testing para API e lean-browser-testing para UI.
- Use Playwright apenas quando o backend crítico estiver estável o suficiente.

Contexto já verificado:
- Backend build passa.
- Frontend build passa.
- Backend lint ainda falha fora dos arquivos já tocados.
- Browser/UI E2E está parcialmente provado: o fluxo autenticado de `/app/maps` funciona após alinhar `sessionStorage`, mas existem testes longos ainda inconclusivos.
- REURB regressão já foi corrigida no teste.
- Tax integration SFTP não pode fingir sucesso.
- REURB export não deve fingir GeoJSON real.
- Uploads precisam continuar com boundary de persistência seguro.
- GIS/CTM ainda precisa hardening.

O que já foi remediado:
- REURB spec ajustado com `x-lgpd-purpose`.
- Tax integration SFTP agora retorna erro explícito.
- REURB dossier export agora usa placeholder honesto em vez de GeoJSON fake.
- Upload controller agora usa disk-backed staging.
- Upload service persiste e remove staging files.
- Auth helpers de Playwright para mapas / REURB / integrações foram alinhados ao `sessionStorage` real do app.
- O fluxo autenticado de `/app/maps` e o draw E2E passaram depois do ajuste de sessão.

Ordem de execução recomendada:
1. Finalizar ou encurtar os testes E2E ainda longos que continuam inconclusivos:
   - `maps-smoke`
   - `reurb-flow`
   - `critical-flows`
   - qualquer helper remanescente que ainda trate auth como `localStorage`
2. Revalidar REURB apenas se alguma asserção ainda quebrar após o ajuste de helpers.
3. Backend lint hardening nos módulos críticos:
   - CTM
   - PGV
   - REURB
   - tax-integration
   - uploads
   - observatory / monitoring
4. GIS/CTM hardening:
   - GeoJSON import contract
   - CRS/SRID proof path
   - bbox / centroid consistency
   - map ↔ cadastro ↔ backend consistency
5. Remover ou tornar explícitos quaisquer stubs/demos restantes.
6. Browser validation de jornadas centrais quando o backend estiver mais estável.

Formato obrigatório de saída após cada task:
1. Task name
2. Root cause
3. Files inspected
4. Files changed
5. Tests added/updated
6. Validation result
7. What is now fixed
8. What remains NOT PROVEN
9. Next task being started

Lembrete competitivo:
- GeoPixel ainda é superior em CTM profundo, integração fiscal, PGV, monitoramento territorial, trilha de auditoria e operação municipal real.
- FlyDea tem base boa, mas ainda não é municipal-grade.

Comece pelo próximo gap aberto de maior prioridade e vá em frente sem parar entre tarefas se não houver bloqueio real.
