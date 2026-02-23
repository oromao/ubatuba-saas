# Guia Rápido FlyDea Atlas

Este guia resume o uso do sistema (web + mobile/PWA) cobrindo login, mapa, CTM/PGV, levantamentos, integrações, cartas, compliance, PoC e coleta offline.

## 1) Acesso e Perfis
- Web: http://localhost:3000
- Login: email + senha + tenant (ex: `demo`).
- Perfis comuns: Admin, Gestor, Operador (acessos progressivos; ações críticas exigem papel >= Operador).

## 2) Navegação Principal
- **Dashboard**: visão rápida de indicadores.
- **Mapas & Drones**: mapa interativo com camadas, filtros e desenho.
- **CTM**: Parcelas, Logradouros, Mobiliário (cadastro técnico).
- **PGV**: Zonas, Faces, Fatores, Relatório.
- **Integrações**: conectores tributários.
- **Cartas**: templates e lotes de notificação.
- **Compliance**: empresa, responsáveis, ART/RRT, CAT, equipe, checklist.
- **Levantamentos**: entregáveis RGB 5cm e LiDAR/360 (upload, QA, publicação).
- **Mobile (PWA)**: coleta em campo (rota `/mobile`).
- **PoC**: score e evidências (rota `/app/poc`).

## 3) Mapa (Mapas & Drones)
- **Camadas & Filtros** (painel esquerdo): ligar/desligar camadas, opacidade, ordem e filtros por status/zona/valor.
- **Reset view**: botão “Reset”.
- **Tema claro/escuro**: toggle na barra superior do mapa.
- **Identify**: clique simples exibe atributos no painel direito.
- **Desenho** (Terreno/Edificação):
  - Clique esquerdo adiciona vértices; use 4+ vértices para polígonos; duplo clique fecha.
  - Selecionar/Editar permite mover vértices; Excluir remove geometrias.
  - Salve dando nome/descrição/status; fica em “Parcelas desenhadas”/“Edificações desenhadas”.

## 4) CTM (Cadastro Técnico Multifinalitário)
- **Parcela**: criar/editar (geo obrigatória), workflow `PENDENTE/EM_VALIDACAO/APROVADA/REPROVADA` e pendências automáticas (sem endereço, inscrição, geometria, área, status).
- **Histórico/Auditoria**: `GET /ctm/parcels/:id/history` e painel de histórico na UI.
- **Pendências**: tabela “Pendências” em `/app/ctm/parcelas`.
- **Logradouros/Mobiliário**: CRUD e ligação com parcelas.

## 5) PGV (Planta Genérica de Valores)
- **Zonas/Faces/Fatores**: mantenha versões ativas e fatores por categoria.
- **Cálculo**: no painel da parcela (aba PGV) clique “Calcular PGV”.
- **Impacto e Traço**: endpoints e UI suportam `Impact report` e `Trace` (versões e memória de cálculo).

## 6) Levantamentos & Entregáveis
- Tela `/app/levantamentos`:
  - Criar levantamento (RGB 5cm ou LiDAR/360) com metadados (data, GSD, SRC, responsável, fornecedor, área/bbox).
  - Upload via presigned (GeoTIFF/COG, mosaico, relatório, 360, LAS/LAZ).
  - QA checklist (cobertura, georreferenciamento, qualidade, comentários).
  - Publicar: cria store/layer no GeoServer e registra camada no catálogo.
  - Downloads: links presigned por arquivo.

## 7) Integrações Tributárias
- Tela `/app/integracoes`:
  - Conectores `REST_JSON`, `CSV_UPLOAD`, `SFTP (stub)`.
  - Configurar mapeamento de campos (inscrição, contribuinte, endereço, venal, dívida).
  - Ações: Testar conexão, Rodar sync manual, ver Logs.

## 8) Cartas de Notificação
- Tela `/app/cartas`:
  - Templates versionados (HTML com `{{variaveis}}`, preview).
  - Geração em lote por filtros (ex.: parcelas pendentes/reprovadas).
  - PDFs gerados no servidor, armazenados no MinIO; baixar via presigned.
  - Protocolo/status por lote e carta (GERADA/ENTREGUE/DEVOLVIDA).

## 9) Compliance
- Tela `/app/compliance`:
  - Empresa (CREA/CAU, validade, anexos).
  - Responsáveis técnicos (CREA/CAU, validade, docs).
  - ART/RRT, CAT (número, data, validade, vínculo a levantamento/projeto, anexos).
  - Equipe técnica (cargos, currículo/anexos, atribuições).
  - Checklist de conformidade por requisito (MD, CREA/CAU, CAT, equipe), com evidências e auditoria.

## 10) Mobile PWA (Campo)
- Acesse `/mobile` no navegador (instalável). Exige login JWT.
- Funcionalidades:
  - Buscar parcela (SQLU/inscrição/endereço).
  - Checklist de campo (ocupação, endereço, infraestrutura, notas).
  - Foto (base64) e geolocalização.
  - Salvar offline em IndexedDB; fila aparece na tela.
  - Sync automático ao voltar online ou botão “Sincronizar agora” → `POST /mobile/ctm-sync`.

## 11) PoC 95%
- Página `/app/poc`: mostra score, checks e evidências.
- Endpoints: `GET /poc/health`, `GET /poc/score`.
- Checks automatizados: `npm run poc:checks` (usa `poc/checks/run-checks.mjs`).
- Seed de demonstração: `node poc/seed/load-seed.mjs` com `POC_ACCESS_TOKEN` e `POC_TENANT_ID`.

## 12) Deploy & Observabilidade (resumo)
- Blueprint AWS: `docs/cloud-deploy.md` (ECS/ECR/S3/Atlas/GeoServer).
- IaC skeleton: `infra/iac/terraform/*`.
- Métricas: `GET /metrics` (Prometheus). Correlation-id em cabeçalhos e respostas.

## 13) Dicas rápidas de operação
- Sempre defina tenant (header `X-Tenant-Id`) nas chamadas API se usar ferramentas externas.
- Para desenhar, use tema claro/escuro conforme luminosidade e lembre de 4+ pontos para polígonos.
- Depois de alterar camadas, use “Reset” para recarregar visão padrão do projeto.
- Mantenha um conector CSV configurado para testes rápidos de integração.
