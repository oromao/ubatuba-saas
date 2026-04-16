# Roteiro de Demonstração (Bate-Frente Geopixel)

## Objetivo
Posicionar o **FlyDea Atlas** como uma suíte 100% cloud, imune a quedas, e superior aos legados em governança e operação móvel.

## Abertura: Landing e Login (2 min)
- **Apresentar a Landing Page:** Reforce que o sistema é SaaS e modular.
- **Login Institucional:** Mostre o SSO Multi-Tenant, provando que o ambiente é 100% segregado por município (ex: Ubatuba). Logue com o perfil "Admin" ou "Gestor".

## Fase 1: Painel Executivo & Dashboard (3 min)
- Assim que logar, foque na clareza do Painel (Sinais de Prontidão e Saúde do Satélite).
- **Cartada visual:** Exiba o widget do `MiniMap` com os polígonos, provando a integração geográfica e não apenas cadastral ("Veja, o mapa já nasce embutido nos seus KPIs").
- Explique que o Hub de Integração (OIDC) permite que o cidadão de Ubatuba continue usando o portal atual da prefeitura, sem interrupções.

## Fase 2: O Novo CTM Vivo (4 min)
- Vá até o módulo **CTM > Parcelas**.
- A tela vai abrir com a lista de imóveis à direita e o **Mapa Interativo (MapLibre)** renderizando GeoJSON em tempo real à esquerda.
- **O Foco:** Aponte para as métricas consolidadas (Total, Ativos, Pendências). Mostre o Badge "P0 CTM". Isso transmite autoridade tributária imediata e mata o discurso de "software só de chamados".

## Fase 3: Monitoramento & App Offline (3 min)
- Exiba a tela de Monitoramento Territorial/Ambiental.
- Aqui entra a verdadeira vantagem competitiva:
  - Fale sobre a integração **PWA Mobile Offline**.
  - Diga: *"Diferente de sistemas engessados, o fiscal tira fotos de uma invasão de área num local sem sinal de internet, e o FlyDea gerencia a sincronização com IndexedDB local, assinando o hash criptográfico."*

## Encerramento e Auditoria (2 min)
- Finalize com **Certidões** (validação de hash) ou com **REURB**.
- Destaque que 100% das ações estão submetidas a Logs de Auditoria LGPD inquebráveis.

## Fase 4: PGV Fazendária de Verdade (4 min)
- Vá para **PGV > Relatório** e monte um cenário com filtros por zona, face, bairro e logradouro.
- Mostre o comparativo **valor venal atual vs. proposto** e chame atenção para o **impacto estimado de arrecadação**.
- Aponte a lista de imóveis impactados e a quebra territorial por bairro / via / uso.
- Se houver cenário persistido, mostre que a Fazenda pode guardar cenários e comparar versões.
- Frase de fechamento: *"Aqui a PGV deixa de ser tabela e vira motor de justiça fiscal com leitura executiva."*

## Fase 5: Alvarás com Tramitação Real (4 min)
- Abra **Alvará de Obras** e depois **Alvará de Empresas**.
- Mostre que o processo agora tem **etapas**, **responsável por fase**, **exigências**, **evidências**, **parecer** e **decisão final**.
- Faça a banca ver a trilha de auditoria e uma devolutiva ou deferimento final.
- Frase de fechamento: *"Isso não é troca de status; é processo administrativo com memória, responsabilidade e prova."*
