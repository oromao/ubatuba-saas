# 07 — Definitions (Vocabulário obrigatório)

> Palavras têm peso. Use estas e só estas quando classificar qualquer rota, módulo ou feature.

---

## 1. Categorias de Maturidade (Core)

### `REAL`
O fluxo tem: UI real, API real, DB real, Teste real e Revisão humana. Ausência de **qualquer um** → não é REAL.

### `PARTIAL`
Funciona em parte, mas falha em um ou mais critérios de REAL. **Não conta como DONE**.

### `ZOMBIE`
Existe no código mas não é navegável ou não tem fluxo real. Ação: `HIDE` ou `ARCHIVE`.

### `FAKE`
Parece pronto mas usa mocks, dados hardcoded ou fallbacks que mascaram a ausência de backend. Ação: `FIX` ou `ARCHIVE`.

### `DEAD`
Código não referenciado nem usado. Ação: `ARCHIVE`.

---

## 2. Estados de Prontidão (Readiness)

### `DEMO-READY`
Seguro para apresentações controladas com dataset específico. Possui "falsos positivos" aceitáveis para venda, mas não para produção.

### `POC-READY`
Estável o suficiente para um piloto com dataset real reduzido e acompanhamento técnico.

### `LICITATION-READY`
Atende aos requisitos técnicos e documentais de editais públicos. Provado em escala e segurança.

### `MUNICIPAL-GRADE`
Pronto para produção em larga escala, auditável, multi-tenant seguro e resiliente.

---

## 3. Qualificadores Técnicos

### `MOCK-DEPENDENT`
A funcionalidade depende de dados simulados para rodar. Score máximo: 2.

### `REAL-DATA-PROVEN`
Validado com dataset real de grande escala (ex: 50k+ parcelas de SP).

### `TENANT-SAFE`
Provado que não vaza dados entre prefeituras diferentes.

---

## 4. Status de Planejamento

### `MERGED`
Item de backlog ou arquivo que foi consolidado em outro para evitar duplicidade.

### `PARKING-LOT`
Ideias ou features futuras que foram removidas do roadmap ativo para evitar distração.

---

## 5. Termos de Prova

### "Prova" (Proof)
Apenas testes automatizados (P1-P8) que passam em CI são considerados prova. "Funcionou na minha máquina" não é prova.

### "Persistência Real"
Dados gravados em banco de dados central (Mongo/Postgres), não em `localStorage` ou caches voláteis.

---

## Tabela de Tradução (Evite Vaguismos)

| Errado | Certo |
|---|---|
| "Está pronto" | "Está `REAL` e provado por `[ID de Teste]`" |
| "Está funcionando" | "Status `POC-READY` com dados reais" |
| "Tem um mock" | "Status `FAKE` ou `MOCK-DEPENDENT`" |
| "Vou testar depois" | "Status `PARTIAL`, bloqueado por falta de teste" |
