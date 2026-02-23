# Guia Completo FlyDea (Ponta a Ponta)

Data: 2026-02-20

## 1. Visao geral
Este guia cobre uso completo do sistema por perfil, do primeiro acesso ate operacao diaria:
- Home -> Login -> Dashboard
- Mapas e desenho
- CTM (Parcelas, Logradouros, Mobiliario)
- PGV (Zonas, Faces, Fatores, Relatorio)
- Integracoes tributarias (com logs)
- Cartas, Compliance, Alertas, Processos, Ativos
- Mobile de campo

## 2. Perfis e responsabilidades
- `ADMIN`: governanca da plataforma, configuracoes criticas, validacao final.
- `GESTOR`: acompanhamento executivo, aprovacoes operacionais, monitoramento de integracoes.
- `OPERADOR`: operacao tecnica diaria (cadastros, mapas, sincronizacoes).
- `CAMPO` (perfil operacional): coleta em campo via modulo mobile.
- `LEITOR`: consulta e auditoria (sem escrita nos modulos restritos).

## 3. Primeiro acesso
1. Abra `http://localhost:3000`.
2. Clique em entrar e use:
- tenant: `demo`
- usuario/senha do seu perfil
3. Ao entrar, voce cai no `Dashboard`.

## 4. Fluxo recomendado por perfil

### 4.1 ADMIN (fluxo completo)
1. Dashboard: verificar indicadores e operacao do dia.
2. Integracoes: validar conectores, executar teste de conexao, sync manual e checar logs.
3. Mapas: validar camadas, desenhar/editar/excluir geometrias.
4. CTM: revisar parcelas/logradouros/mobiliario.
5. PGV: validar zonas/faces/fatores e relatorio.
6. Cartas e Compliance: revisar emissao e conformidade.
7. Mobile: verificar fila e sincronizacao.

### 4.2 GESTOR
1. Dashboard e PoC para status geral.
2. Integracoes para acompanhar sucesso/erro de sincronizacao.
3. Modulos de negocio para validacao e acompanhamento.

### 4.3 OPERADOR
1. CTM + PGV no dia a dia.
2. Mapas para ajustes e geometrias.
3. Integracoes para execucao assistida de sync manual.
4. Mobile para envio de coletas.

### 4.4 CAMPO
1. Acesse `/mobile`.
2. Busque parcela, preencha checklist, capture localizacao/foto.
3. Salve offline se necessario e sincronize ao voltar internet.

### 4.5 LEITOR
1. Consulte dashboard, PoC e telas permitidas.
2. Sem operacoes destrutivas ou alteracoes de cadastros.

## 5. Integracoes tributarias (fluxo robusto)
Tela: `/app/integracoes`

### 5.1 Criar conector
1. Informe `Nome`.
2. Selecione `Modo`:
- `REST_JSON`: preencher endpoint (token opcional).
- `CSV_UPLOAD`: usar payload CSV para testes.
- `SFTP`: preencher host (usuario/path opcionais).
3. Clique `Criar`.

### 5.2 Validar conectividade
1. Selecione um conector na lista.
2. Clique `Testar`.
3. Verifique retorno e status no bloco de logs.

### 5.3 Rodar sincronizacao manual
1. Para CSV, ajuste o payload no bloco de teste.
2. Clique `Sync manual`.
3. Confira `status`, `processed`, `errors` e `message` nos logs.

### 5.4 Analisar erro
1. Abra o card `Logs de sincronizacao`.
2. Use `Atualizar logs`.
3. Expanda `Ver detalhes` para inspecionar JSON completo do log.
4. Corrija configuracao (endpoint/host/mapeamento) e rode novamente.

## 6. Mapa e desenho
Tela: `/app/maps`

1. Ative camadas no painel lateral.
2. Use `Desenhar Terreno` ou `Desenhar Edificacao`.
3. Clique para criar vertices; duplo clique finaliza poligono.
4. Salve com status e descricao.
5. Para editar, use `Selecionar/Editar`.
6. Para excluir, use `Excluir`.

## 7. CTM e PGV

### 7.1 CTM
- Parcelas: busca, edicao cadastral, validacao de pendencias.
- Logradouros: manutencao de vias e codigos.
- Mobiliario: registro e atualizacao de itens urbanos.

### 7.2 PGV
- Zonas/Faces/Fatores: configuracao de valoracao.
- Relatorio: analise consolidada e exportacoes.

## 8. Cartas, compliance e operacao
- Cartas: templates, lotes e download de documentos.
- Compliance: dados obrigatorios tecnicos e institucionais.
- Alertas/Processos/Ativos: operacao e monitoramento continuo.

## 9. Troubleshooting rapido
- Erro de login: validar tenant e credenciais.
- Integracao em erro: revisar config e log detalhado.
- Mapa lento: reduzir camadas ativas simultaneas.
- Mobile sem sync: confirmar conectividade e retry manual.

## 10. Checklist de aderencia operacional (licitacao)
- Acesso por perfil com RBAC valido.
- Fluxos CTM/PGV operacionais.
- Integracao tributaria com logs auditaveis.
- Cartas e compliance funcionais.
- Mobile com sincronizacao controlada.
- Evidencias de teste (trace/video/screenshot) disponiveis.
