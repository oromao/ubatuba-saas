# Gap Analysis — Ubatuba CE 24/2025 (MVP REURB-S)

Data: 2026-02-23
Fonte: Edital nº 179/2025 e Anexo VI (Termo de Referencia) no arquivo `Pref Ubatuba - CE 24.2025.pdf`.
Escopo deste gap: apenas requisitos tecnologicos/operacionais que fazem sentido no SaaS (fluxo REURB-S e entregaveis digitais).

## Veredito
PASSA NO MVP REURB-S (conforme `docs/ubatuba-ce24-2025-requisitos.md`).

## Cobertura por requisito MVP (docs/ubatuba-ce24-2025-requisitos.md)
Status: OK / PARCIAL / GAP

1. Cadastro de Projeto REURB-S (CRUD, status, responsaveis): OK
   - API: `POST/GET/PATCH /reurb/projects`
   - UI: `/app/reurb`
2. Cadastro de familias/beneficiarios e unidades/imoveis: OK
   - API: `POST/GET/PATCH /reurb/families`, `POST/GET/PATCH /reurb/units`
3. Upload e versionamento de documentos por projeto/unidade/familia: OK
   - API: `.../documents/presign-upload` + `complete-upload`
4. Notificacoes (email) com evidencias: OK
   - Templates + envio + evidencias; SMS mantido como stub.
5. Exportacoes tabulares (CSV/XLSX/JSON) e Planilha Sintese: OK
   - API: `/reurb/families/export.*` e `/reurb/planilha-sintese/generate`
6. Pacote Cartorio/CRF (ZIP com indice e anexos): OK
   - API: `/reurb/cartorio/package`
7. Auditoria + RBAC: OK
   - Logs em `reurb_audit_logs`, RBAC por endpoint.

## Entregaveis do Termo de Referencia (Lote Unico) — mapeamento SaaS
Status: OK (suporte documental), FORA (execucao de campo)

1. Cronograma fisico de servicos/obras: OK (registravel via documentos/metadata do projeto)
2. Estudo preliminar juridico/urbanistico/ambiental: OK (documentos no dossie)
3. Estudo tecnico ambiental: OK (documentos no dossie)
4. Estudo tecnico de risco: OK (documentos no dossie)
5. LEPAC + memoriais descritivos: OK (documentos por unidade/projeto)
6. Levantamento planialtimetrico cadastral + ART/RRT: OK (documentos)
7. Planilha sintese Excel: OK (geracao XLSX)
8. Planta do perimetro do nucleo: OK (documentos)
9. Projeto urbanistico completo: OK (documentos)
10. Solucoes socioambientais/reassentamento: OK (documentos)
11. Relatorio protocolo do pedido de registro: OK (documentos)
12. Instrumentos de titulacao e titulos individuais: OK (documentos)
13. Relatorio situacao fatica + cadastro familias + banco tabulado: OK (cadastro + exportacoes)
14. Relatorio de assessoria com atas: OK (documentos)
15. Termo de compromisso do cronograma: OK (documentos)

Observacao: o SaaS nao gera levantamentos/projetos tecnicos; ele organiza, registra e exporta os produtos tecnicos entregues pela equipe de campo.

## Disposicoes complementares (fora do escopo do contratado)
O TR indica que notificacoes oficiais, aprovacao da REURB/CRF e titulacao/registro sao do Municipio. O SaaS oferece suporte operacional (templates, evidencias, exportacoes), mas nao substitui ato administrativo.

## Pontos residuais (nao bloqueiam MVP)
- SMS real: adapter existe, operacao em modo stub se sem credenciais.
- Exigencias administrativas do edital (habilitacao/credenciamento/contrato) sao fora do SaaS.
