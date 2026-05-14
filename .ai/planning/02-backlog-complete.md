# Backlog FlyDea — GeoPixel Parity + GIS Forte + SP Data

## Legenda
| Prioridade | Significado |
|---|---|
| **P0** | Bloqueante — sem isso nao existe produto seguro |
| **P1** | Core — GeoPixel parity, funcionalidades obrigatorias |
| **P2** | Valor agregado — monitoramento, observatorio, IA |
| **P3** | Futuro — otimizacao, escala |

---

## 🔴 Fase 0: Higiene e Segurança (Semana 1)
*Prereq: VPS dev mode → minimo seguro*

| ID | Item | Prioridade | Esforco |
|---|---|---|---|
| SEC-001 | Remover Mongo Express da exposicao publica (:8081) | P0 🔴 | 5min |
| SEC-002 | Remover GeoServer/MinIO Console/:9001 da exposicao direta | P0 🔴 | 5min |
| SEC-003 | Adicionar autenticacao no GeoServer (trocar senha default) | P0 🔴 | 15min |
| SEC-004 | Rodar com profile prod (nginx reverse proxy) | P0 🔴 | 30min |
| SEC-005 | SSL/HTTPS com Let's Encrypt + Certbot | P0 🔴 | 30min |
| SEC-006 | Rotacionar todas as senhas (rootpass, minioadmin, geoserver, JWT) | P0 🔴 | 15min |
| SEC-007 | Configurar firewall VPS (so portas 22, 80, 443 abertas) | P0 🔴 | 15min |

**Entregavel**: VPS segura, so portas 22/80/443, HTTPS, senhas fortes.

---

## 📦 Fase 1: GeoPixel Parity (Sprints 1-2)
*Core funcional = CTM + PGV + IPTU + Alvaras + Processos*

| ID | Item | Prioridade | Modulo |
|---|---|---|---|
| CORE-001 | Validar importacao GeoSampa setores 001-005 com geometria correta | P1 | CTM |
| CORE-002 | Busca de parcela por inscricao imobiliaria, SQLU, endereco | P1 | CTM |
| CORE-003 | Mapa com overlay de parcelas (MapLibre + MVT tiles) | P1 | GIS |
| CORE-004 | Camadas de zoneamento SP (50+ layers no mapa) | P1 | GIS |
| CORE-005 | PGV: zonas reais (nao mock), integradas ao mapa | P1 | PGV |
| CORE-006 | IPTU: calculo com aliquotas por tenant + emissao de guia | P1 | IPTU |
| CORE-007 | Alvara Obras: workflow completo (solicitar → analisar → aprovar) | P1 | Permits |
| CORE-008 | Alvara Empresas: workflow completo | P1 | Permits |
| CORE-009 | Certidao Digital: solicitacao → geracao → download | P1 | Certificates |
| CORE-010 | Vistoria mobile: app + geolocalizacao + fotos + offline | P1 | Mobile |
| CORE-011 | Atendimento 156: abertura → triagem → resolucao | P1 | Citizen |
| CORE-012 | Gestao de Cemiterio: sepulturas, concessionarios | P1 | Cemetery |
| CORE-013 | Obras Publicas: orcamento, cronograma, execucao | P1 | Public Works |

---

## 🛰️ Fase 2: Monitoramento por Satélite (Sprints 3-4)
*Diferencial competitivo — mudancas urbanas + ambiental*

| ID | Item | Prioridade | Detalhes |
|---|---|---|---|
| SAT-001 | Pipeline de download de imagens Sentinel-2 (10m resolution) | P2 | Script automatizado semanal |
| SAT-002 | Algoritmo de deteccao de novas construcoes (NDBI + ML) | P2 | Comparacao temporal de imagens |
| SAT-003 | Alerta de nova construcao → notificacao no sistema | P2 | Integrar com CTM |
| SAT-004 | Sugestao de atualizacao cadastral (IPTU) automática | P2 | "Construcao detectada — revisar cadastro" |
| SAT-005 | Monitoramento ambiental: desmatamento, queimadas | P2 | NDVI temporal |
| SAT-006 | Dashboard de mudancas por regiao/municipio | P2 | Mapa heatmap |
| SAT-007 | Zelador.IA: deteccao de deterioracao urbana (pocas, calcadas) | P2 | IA em imagens de satelite |

---

## 📊 Fase 3: Observatorio + IA (Sprint 5)
*Observatorio do Mercado Imobiliario (OMI)*

| ID | Item | Prioridade | Detalhes |
|---|---|---|---|
| OMI-001 | Dashboard de precos imobiliarios por regiao | P2 | Baseado em PGV + IPTU |
| OMI-002 | Tendencias temporais (valorizacao por bairro) | P2 | Serie historica |
| OMI-003 | Comparativo entre municipios | P3 | Multi-tenant |
| OMI-004 | Relatorios exportaveis (PDF, Excel) | P2 | Para gestores |
| IA-001 | Chatbot para contribuinte (duvidas sobre IPTU, processos) | P3 | LLM integrado |
| IA-002 | Recomendacao de zoneamento para novas construcoes | P3 | Baseado em regras + ML |

---

## 🏗️ Fase 4: Maturidade (Continuo)
*DevOps, qualidade, escala*

| ID | Item | Prioridade |
|---|---|---|
| OPS-001 | CI/CD GitHub Actions (build + lint + test + deploy VPS) | P1 |
| OPS-002 | Docker images otimizadas (multi-stage build, prod profile) | P1 |
| OPS-003 | Backup MongoDB automatizado (crontab) | P1 |
| OPS-004 | Health check + auto-recovery (docker restart policies) | P1 |
| OPS-005 | Logs centralizados (CloudWatch ou Loki) | P2 |
| OPS-006 | Testes E2E para fluxos criticos (Playwright) | P1 |
| OPS-007 | Testes de carga (k6) | P2 |
| OPS-008 | Documentacao de deploy (runbook) | P2 |

---

## Sprint Planning

| Sprint | Foco | Items |
|---|---|---|
| **Sprint 0** | Seguranca VPS | SEC-001 a SEC-007 (7 items) |
| **Sprint 1** | Deploy prod + CI/CD + CTM/GIS | OPS-001 a OPS-004 + CORE-001 a CORE-004 |
| **Sprint 2** | PGV + IPTU + Alvaras | CORE-005 a CORE-009 |
| **Sprint 3** | Processos + Mobile + Satelite baseline | CORE-010 a CORE-013 + SAT-001 a SAT-003 |
| **Sprint 4** | Satelite avancado + Ambiental | SAT-004 a SAT-007 |
| **Sprint 5** | OMI + Zelador.IA + Qualidade | OMI-001 a OMI-004 + OPS-005 a OPS-008 |
