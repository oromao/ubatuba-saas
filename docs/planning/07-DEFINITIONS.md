# 07 — Definitions (Vocabulário obrigatório)

> Palavras têm peso. Use estas e só estas quando classificar qualquer rota, módulo ou feature.

---

## Categorias de maturidade

### `REAL`
O fluxo tem:
- UI que renderiza com conteúdo concreto (não loader, não demo).
- Chamada real ao backend.
- Backend persistindo em banco real.
- Teste automatizado que executa o caminho ponta a ponta.
- Revisão do Paulo confirmando.

Ausência de **qualquer um** desses cinco → não é REAL.

### `PARTIAL`
Fluxo funciona em parte mas falha em um ou mais dos cinco critérios de REAL.
Exemplos:
- UI funciona mas persiste em localStorage/sessionStorage como primário.
- Backend existe mas não há teste de integração.
- Existe teste mas o fluxo depende de dado mockado.

PARTIAL **não conta como DONE**. Abrir item no `02-BACKLOG.md`.

### `ZOMBIE`
Página/rota/módulo **existe no código** mas:
- Não é navegável sem manipulação manual.
- Não tem fluxo real por trás.
- Não tem teste.
- Ninguém lembra por que foi criado.

Ação: `HIDE` imediatamente do nav principal, abrir item para decidir FIX ou ARCHIVE.

### `FAKE`
Página/componente desenhado para **parecer** pronto mas que é:
- Dado hardcoded/mock apresentado como real.
- Botão que não faz nada.
- Dashboard com gráfico de dados sintéticos.
- Fallback visual que mascara ausência de backend.

Ação: `ARCHIVE` ou `FIX` — nunca deixar em produção pretendendo ser real.

### `DEAD`
Código que:
- Não é referenciado em lugar nenhum.
- Não tem import.
- Não é carregado por nenhuma rota.

Ação: `ARCHIVE` após confirmação de dead-code analysis (`ts-prune`, `knip`, ou equivalente).

---

## Termos complementares

### "Prova"
Um fluxo só é "provado" quando existe um teste automatizado (smoke, integração, ou E2E) que:
- Executa o caminho completo do usuário.
- Valida conteúdo concreto no DOM ou resposta.
- Passa em CI de forma reprodutível.

**Não é prova:**
- "Abri no navegador e funcionou."
- "O endpoint retornou 200."
- "Snapshot está ok."

### "Demo"
Estado/dado que existe para fins de apresentação comercial.
Demo **pode coexistir** com comportamento real, mas:
- Nunca pode ser o comportamento primário de produção.
- Tem que estar atrás de flag explícita (`DEMO_MODE=true`).
- Tem que ser visualmente marcado na UI (banner, badge).

### "Fallback"
Comportamento defensivo quando o caminho real falha (ex: WebGL indisponível, API offline).
Um fallback é aceitável se:
- O caminho real existe e foi testado.
- O fallback é comunicado claramente ao usuário.
- O fallback não mascara bug como funcionalidade.

Fallback que cobre **ausência** de caminho real = FAKE.

### "Persistência real"
Dados gravados em banco (PostgreSQL, o que for) e recuperáveis após:
- Recarregar a página.
- Reiniciar o backend.
- Trocar de dispositivo.
- Trocar de usuário do mesmo tenant.

`localStorage`, `sessionStorage`, `IndexedDB` **não contam** como persistência real para fins de produção.

### "Municipal-grade"
Maturidade suficiente para uma prefeitura real usar sem supervisão técnica diária. Requer:
- Auditabilidade.
- Isolamento multi-tenant comprovado.
- Recuperação de falha sem perda de dado.
- Performance estável com dataset real (não de demo).
- Documentação operacional para o usuário da prefeitura.

---

## Tabela de tradução (quando for tentador usar a palavra errada)

| Tentação | Usar em vez disso |
|---|---|
| "está pronto" | "está `REAL` e provado por `<teste>`" |
| "está funcionando" | "passou `<qual teste>`" |
| "quase lá" | "`PARTIAL`, falta `<critério X>`" |
| "a rota existe" | "a rota existe, status `ZOMBIE`" |
| "tem um mock por enquanto" | "`FAKE`, item `<ID>` no backlog" |
| "vou testar depois" | "`PARTIAL` até teste existir" |
