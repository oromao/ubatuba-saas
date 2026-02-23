# Roteiro de Demonstração PoC (20-30 min)

## 1) Preparacao
1. Subir stack: `docker compose up --build`
2. Login em `http://localhost:3000/login` com `admin@demo.local / Admin@12345 / demo`
3. Abrir tabs:
   - `/app/poc`
   - `/app/levantamentos`
   - `/app/compliance`
   - `/app/integracoes`
   - `/app/cartas`
   - `/mobile`

## 2) Compliance (Req 10-13)
1. Cadastrar dados da empresa, responsavel tecnico, ART/RRT, CAT e equipe.
2. Mostrar checklist de conformidade e trilha de auditoria.

## 3) Integracoes Tributarias (Req 7)
1. Criar conector CSV.
2. Executar `Testar conexao` e `Rodar sync`.
3. Mostrar logs de execucao com contagens.

## 4) Cartas de Notificacao (Req 8)
1. Criar template com variaveis.
2. Gerar lote por filtro de parcelas pendentes.
3. Mostrar PDFs no MinIO (download presigned).

## 5) Levantamentos e Entregaveis (Req 1-2)
1. Criar levantamento `AEROFOTO_RGB_5CM`.
2. Upload de GeoTIFF e QA.
3. Publicar no GeoServer e validar layer no catalogo.
4. Criar levantamento `MOBILE_LIDAR_360` com anexos 360/LAS.

## 6) Mobile PWA (Req 5)
1. Abrir `/mobile` em dispositivo/DevTools mobile.
2. Buscar parcela, preencher checklist, anexar foto e salvar offline.
3. Simular volta de conexao e executar sync.

## 7) PoC score (Req 9)
1. Rodar script de checks: `node poc/checks/run-checks.mjs`
2. Abrir `GET http://localhost:4000/poc/score`
3. Confirmar score >= 95 e revisar evidencias.
