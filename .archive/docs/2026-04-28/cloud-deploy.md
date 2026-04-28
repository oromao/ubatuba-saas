# Cloud Deploy Blueprint (AWS)

## Objetivo
Fornecer um blueprint minimo para publicar FlyDea em nuvem com foco em:
- escalabilidade (web + api)
- dados gerenciados
- observabilidade
- segregacao por ambiente

## Arquitetura de referencia (AWS ECS)
- **ALB** publico com TLS (ACM)
- **ECS Fargate**
  - service `web` (Next.js)
  - service `api` (NestJS)
- **MongoDB Atlas** (ou DocumentDB, se desejado)
- **ElastiCache Redis** (opcional, para cache/rate limit)
- **S3/MinIO** para objetos (entregaveis, PDFs)
- **GeoServer** em ECS (ou EC2 dedicado)
- **CloudWatch Logs + Metrics**
- **Prometheus/Grafana** (opcional) consumindo `/metrics`

## Variaveis essenciais
- `MONGO_URL`
- `JWT_SECRET`
- `REFRESH_SECRET`
- `NEXT_PUBLIC_API_URL`
- `GEOSERVER_URL`
- `GEOSERVER_USER`
- `GEOSERVER_PASSWORD`
- `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET`
- `S3_ACCESS_KEY` / `S3_SECRET_KEY`

## Deploy pipeline (resumo)
1. Build images Docker (`apps/web`, `apps/api`)
2. Push para ECR
3. Terraform aplica infraestrutura base (`infra/iac/terraform`)
4. Atualiza task definition ECS
5. Roda smoke checks (`/health`, `/metrics`, `/poc/score`)

## Observabilidade minima
- Health:
  - API: `GET /health`
  - Web: rota raiz
- Metrics:
  - API: `GET /metrics` (Prometheus format)
- Logs:
  - JSON estruturado
  - `x-correlation-id` em request/response para rastreio

## Segurança
- Secrets em AWS Secrets Manager ou SSM Parameter Store
- TLS obrigatorio no ALB
- SG restrita por principio de menor privilegio
- Rotacao periodica de segredos

## Ambientes recomendados
- `dev`
- `staging`
- `prod`

Cada ambiente com banco e bucket separados.
