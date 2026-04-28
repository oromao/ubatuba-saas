# Guia Completo do FlyDea (Usuarios Leigos)

Data: 2026-02-19  
Ambiente de referencia: Docker local (`dev`)  
Publico: administradores, gestores, analistas de escritorio, equipes de campo e suporte

## 1. Objetivo deste guia

Este documento ensina o uso do sistema de ponta a ponta, com linguagem simples, cobrindo:

- operacao diaria por perfil de usuario
- uso completo do mapa e desenho de geometrias
- modulos CTM, PGV, levantamentos, mobile, integracoes, cartas e compliance
- cobertura dos requisitos da licitacao
- lacunas praticas ainda existentes e como contornar

## 2. Quem usa o sistema (perfis)

### 2.1 Admin da plataforma
- configura ambiente, usuarios e validacoes gerais
- acompanha status de modulos e indicadores
- garante conformidade documental

### 2.2 Gestor municipal
- acompanha indicadores no dashboard
- valida cadastros CTM
- aprova criterios de PGV, relatorios e notificacoes

### 2.3 Operador tecnico (escritorio)
- desenha e edita parcelas/edificacoes no mapa
- faz manutencao de CTM, logradouros, mobiliario
- executa calculos PGV e exportacoes

### 2.4 Equipe de campo (mobile)
- coleta dados em rota/rua
- registra checklist, foto e localizacao
- trabalha offline e sincroniza quando voltar internet

## 3. Primeiro acesso (passo a passo)

## 3.1 Entrar no sistema
1. Abra `http://localhost:3000`.
2. Use credenciais de demo:
- email: `admin@demo.local`
- senha: `Admin@12345`
- tenant: `demo`

## 3.2 Entender a navegacao principal
- `Dashboard`: visao geral
- `Mapas & Drones`: mapa, camadas, desenho, detalhes
- `Levantamentos`: entregaveis RGB/LiDAR e QA
- `Parcelas`, `Logradouros`, `Mobiliario`: CTM
- `Zonas`, `Faces`, `Fatores`, `Relatorio`: PGV
- `Integracoes`: conectores tributarios
- `Cartas`: templates e lotes de notificacao
- `Compliance`: registros obrigatorios (MD, CREA/CAU, CAT, equipe)
- `PoC`: score de aderencia e evidencias

## 3.3 Atalhos uteis (macOS)
- busca global: `Command + K`
- recarregar forte: `Command + Shift + R`
- fechar janela de busca/modal: `Esc`

## 4. Mapa completo (guia principal)

Tela: `Mapas & Drones` (`/app/maps`)

## 4.1 Controles basicos
1. Ative camadas no painel esquerdo.
2. Ajuste opacidade da camada.
3. Mude ordem (`Up`/`Down`) quando necessario.
4. Use `Reset` para voltar ao enquadramento inicial.
5. Clique no mapa para abrir detalhes na lateral direita.

## 4.2 Desenhar terreno ou edificacao
1. Clique em `Desenhar Terreno` ou `Desenhar Edificacao`.
2. Clique no mapa para criar vertices (bolinhas laranja).
3. A linha do desenho aparece entre os pontos.
4. Dê duplo clique para fechar o poligono.
5. No modal, informe:
- nome (opcional)
- descricao (opcional)
- status (`ATIVO`, `INATIVO`, `CONFLITO`)
6. Clique em `Salvar`.

Regras:
- minimo: 3 pontos distintos (poligono valido)
- `Esc`: cancela desenho
- se nao salvar no modal, a geometria nao entra no cadastro

## 4.3 Editar desenho
1. Clique em `Selecionar/Editar`.
2. Clique na geometria.
3. Arraste vertices para ajustar.
4. O sistema atualiza a geometria automaticamente.

## 4.4 Excluir desenho
1. Clique em `Excluir`.
2. Clique na geometria que deseja apagar.
3. O sistema remove a geometria imediatamente.

Observacao:
- no modo excluir, cada clique em geometria remove a feicao clicada.

## 4.5 Erros comuns no mapa e como resolver

### Nao vejo linha/vertices enquanto desenho
1. Hard reload (`Command + Shift + R`).
2. Verifique se clicou em `Desenhar Terreno` ou `Desenhar Edificacao`.

### Geometria nao salva
1. Confira se fechou o poligono com duplo clique.
2. Confirme que tem 3+ pontos distintos.
3. Tente salvar novamente com status `ATIVO`.

### Mapa lento
1. Feche abas pesadas do navegador.
2. Reduza camadas ativas ao mesmo tempo.
3. Reabra a pagina.

## 5. CTM (Cadastro Tecnico Multifinalitario)

## 5.1 Parcelas
Tela: `/app/ctm/parcelas`

Fluxo:
1. Buscar parcela por inscricao/SQLU/endereco.
2. Abrir detalhe da parcela.
3. Atualizar dados:
- predial
- socioeconomico
- infraestrutura
4. Validar pendencias cadastrais.

Workflow esperado:
- `PENDENTE`
- `EM_VALIDACAO`
- `APROVADA`
- `REPROVADA`

## 5.2 Logradouros
Tela: `/app/ctm/logradouros`

Uso:
1. Cadastrar e editar nomes/tipos/codigos de vias.
2. Manter base coerente para enderecamento das parcelas.

## 5.3 Mobiliario urbano
Tela: `/app/ctm/mobiliario`

Uso:
1. Registrar itens urbanos.
2. Atualizar atributos e consultar no mapa.

## 6. PGV (Planta Generica de Valores)

## 6.1 Zonas de valor
Tela: `/app/pgv/zonas`

Uso:
1. Criar e manter zonas com geometrias.
2. Definir parametros base de valor.

## 6.2 Faces de quadra
Tela: `/app/pgv/faces`

Uso:
1. Manter faces de quadra.
2. Relacionar face com valor por m2.

## 6.3 Fatores
Tela: `/app/pgv/fatores`

Uso:
1. Configurar fatores de terreno e construcao.
2. Ajustar pesos conforme regras tecnicas locais.

## 6.4 Calcular PGV no mapa
1. No mapa, clique numa parcela.
2. No painel direito, abra aba `PGV`.
3. Clique em `Calcular PGV`.
4. Veja valor total, terreno e construcao.

## 6.5 Relatorios e exportacao
- CSV de valores venais
- GeoJSON com valor venal por parcela

## 7. Levantamentos (RGB 5cm e LiDAR/360)

Tela: `/app/levantamentos`

Fluxo recomendado:
1. Criar levantamento (tipo e metadados).
2. Fazer upload dos arquivos (GeoTIFF/COG/360/LAS-LAZ conforme tipo).
3. Executar checklist de QA.
4. Publicar quando aprovado.
5. Validar camada publicada no mapa.

Status tipicos:
- `RECEBIDO`
- `VALIDANDO`
- `PUBLICADO`
- `REPROVADO`

## 8. Mobile (equipe de campo)

Tela/rota: `/mobile`

Fluxo de rua:
1. Abrir app mobile no navegador do celular.
2. Buscar parcela.
3. Preencher checklist de campo.
4. Anexar foto e localizacao.
5. Salvar (funciona offline).
6. Sincronizar quando voltar internet.

## 9. Integracoes tributarias

Tela: `/app/integracoes`

Fluxo:
1. Criar conector.
2. Definir mapeamento de campos.
3. Testar conexao.
4. Executar sincronizacao manual.
5. Acompanhar logs.

Tipos atuais:
- `REST_JSON`
- `CSV_UPLOAD`
- `SFTP` (stub tecnico)

## 10. Cartas de notificacao

Tela: `/app/cartas`

Fluxo:
1. Criar template.
2. Fazer preview.
3. Gerar lote.
4. Emitir PDF.
5. Baixar e acompanhar status/protocolo.

## 11. Compliance (exigencias legais/tecnicas)

Tela: `/app/compliance`

Itens principais:
1. Dados da empresa.
2. Responsaveis tecnicos (CREA/CAU).
3. ART/RRT.
4. CAT.
5. Equipe tecnica especializada.
6. Checklist de conformidade com evidencias.

## 12. PoC e evidencias de aderencia

Tela: `/app/poc`

Uso:
1. Conferir score de aderencia.
2. Validar checks executados.
3. Confirmar evidencias para demonstracao formal.

## 13. Cobertura da licitacao (visao de usuario)

Com base na documentacao do projeto, os itens de licitacao estao cobertos no produto:

1. Aerolevantamento RGB 5cm  
2. Mapeamento movel 360 + LiDAR  
3. Atualizacao cadastral imobiliaria  
4. Atualizacao PGV  
5. Plataforma web + mobile  
6. Estrategia de hospedagem em nuvem  
7. Integracao com tributario municipal  
8. Cartas de notificacao  
9. PoC de aderencia >= 95%  
10. Registro Ministerio da Defesa  
11. Registro CREA/CAU  
12. CAT registrada  
13. Equipe tecnica especializada

## 14. Lacunas praticas ainda existentes (importante)

Mesmo com cobertura funcional, ainda existem pontos de maturidade para operacao plena:

1. Conector SFTP ainda esta como `stub` (nao fluxo completo de producao).
2. Deploy em nuvem possui blueprint e IaC base, mas exige finalizacao por ambiente real (`staging/prod`).
3. Processo operacional (SLA, governanca e treinamento formal da prefeitura) depende da implantacao local.
4. Alguns assets visuais opcionais podem retornar 404 sem impactar funcoes principais.

## 15. Roteiro de treinamento sugerido (1 semana)

Dia 1:
1. Acesso, perfis e navegacao.
2. Mapa basico e filtros.

Dia 2:
1. Desenho completo (criar, editar, excluir).
2. Operacao CTM (parcela, logradouro, mobiliario).

Dia 3:
1. PGV (zonas, faces, fatores, calculo e relatorio).

Dia 4:
1. Levantamentos e QA.
2. Publicacao e validacao no mapa.

Dia 5:
1. Integracoes, cartas e compliance.
2. Mobile de campo (offline/sync).
3. PoC e evidencias finais.

## 16. Checklist rapido de operacao diaria

1. Confirmar login no tenant correto.
2. Verificar dashboard e alertas.
3. Atualizar CTM/PGV pendentes.
4. Executar tarefas de campo e sync.
5. Validar compliance/documentos.
6. Gerar relatorios/cartas quando necessario.
7. Registrar problemas e evidencias do dia.

## 17. Suporte tecnico (quando acionar)

Acione suporte quando houver:
- erro recorrente de login/tenant
- falha de sincronizacao de campo
- erro de publicacao de levantamento
- divergencia grave entre mapa e cadastro
- falha de integracao tributaria

Informacoes para enviar ao suporte:
1. modulo e tela com problema
2. horario aproximado
3. usuario/tenant
4. print da tela e mensagem de erro
5. passo a passo para reproduzir
