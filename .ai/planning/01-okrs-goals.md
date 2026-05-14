# FlyDea — Plano Estrategico 2026-2027
# GovTech Multi-tenant com GIS Forte e Dados Reais de SP

## Posicionamento
FlyDea é um SaaS GovTech multi-tenant que compete com GeoPixel oferecendo:
- **Multi-tenant nativo** (GeoPixel = instância por cliente)
- **Stack moderna** (Next.js/NestJS/MongoDB vs legado)
- **Dados abertos integrados** (GeoSampa, OSM, SP Mapas)
- **IA para deteccao de mudancas** via satélite (igual GeoPixel Monitor + Zelador.IA)

---

## 🎯 Objective 1: Produto Core Maduro (GeoPixel Parity)

Paridade funcional com GeoPixel nos 15+ produtos.

| KR | Métrica | Atual | Target |
|---|---|---|---|
| KR-1.1 | CTM com dados reais de SP validados | 5 setores GeoSampa | 10+ setores + integracao continua |
| KR-1.2 | PGV com zonas reais | Mock (ZV-01/02/03) | Dados reais de SP |
| KR-1.3 | Calculo IPTU com aliquotas por municipio | Funcional | Configuravel por tenant |
| KR-1.4 | Alvara Obras + Empresas completos | Module exists | Workflow ponta-a-ponta testado |
| KR-1.5 | Certidao Digital integrada | Module exists | Integrado com processo |

## 🎯 Objective 2: GIS + Satélite (Diferencial)

Monitoramento de mudancas urbanas e ambientais por satelite.

| KR | Métrica | Target |
|---|---|---|
| KR-2.1 | Pipeline de imagens Sentinel/Landsat automatizado | Download + processamento |
| KR-2.2 | Deteccao de novas construcoes por IA | Precisao > 80% |
| KR-2.3 | Deteccao de alteracoes ambientais (desmatamento) | Alertas por regiao |
| KR-2.4 | Integracao com cadastro (atualizar IPTU automaticamente) | Mudanca → notificacao → revisao |

## 🎯 Objective 3: Producao Segura e Profissional

Sair do profile dev e ter um ambiente profissional.

| KR | Métrica | Atual | Target |
|---|---|---|---|
| KR-3.1 | Deploy profissional (nginx + SSL + prod profile) | Dev profile 🔴 | Prod profile |
| KR-3.2 | Seguranca: sem portas expostas desnecessarias | 8 portas 🔴 | So 80/443 |
| KR-3.3 | CI/CD automatizado | Manual | GitHub Actions |
| KR-3.4 | Backup automatizado | Nao existe | Diario + restaurado testado |
| KR-3.5 | Monitoring (health, logs, metricas) | Nao existe | CloudWatch ou similar |

## 🎯 Objective 4: Observatorio + IA

Features de alto valor agregado.

| KR | Métrica | Target |
|---|---|---|
| KR-4.1 | Observatorio do Mercado Imobiliario (OMI) | Dashboard de precos, tendencias, comparativos |
| KR-4.2 | Zelador.IA (manutencao urbana via satelite) | Deteccao de deterioracao urbana |
| KR-4.3 | Alertas automaticos para fiscais municipais | Notificacao via app/web |
