# Business Context — FlyDea GovTech (REVISADO)

## O que é FlyDea?
Plataforma SaaS GovTech de **geo-inteligência municipal**.
Core: GIS (mapa) + CTM (cadastro) + PGV (valoração) + IPTU (tributação) + REURB (regularização fundiária).

## Maturidade REAL
- MVP funcional com 38 módulos no backend
- Dados reais de São Paulo (5 setores fiscais do GeoSampa)
- Cálculo de IPTU e PGV operacionais
- Multi-tenant com isolamento por collection + TenantGuard
- **Não está em produção** — falta deploy, CI/CD, homologação

## Stack Real
| Componente | Tecnologia |
|---|---|
| Database | MongoDB 7 (Mongoose ODM) |
| GIS Server | GeoServer 2.24.2 (WMS/WFS) |
| Cache | Redis 7 |
| Object Storage | MinIO (S3) |
| Mapa Frontend | MapLibre GL |
| Backend | NestJS + TypeScript |
| Frontend | Next.js 14 (App Router) |

## Dados GIS
- **Fonte oficial**: GeoSampa (Prefeitura de SP) via WFS
- **OSM**: Building footprints de São Paulo (centro)
- **Zoneamento**: 50+ camadas (Zona Urbana, ZEIS, Parques, Risco Geológico, Transporte)
- **Mock**: Dados sintéticos para demonstração (Ubatuba)

## Concorrentes
- GeoPixel (referência de maturidade)
- Sistemas legados municipais

## Objetivo Imediato
1. Pipeline CI/CD funcional
2. Deploy em homologação (ECS Fargate)
3. Validar com dados reais e usuário real
4. Expandir para outros municípios
