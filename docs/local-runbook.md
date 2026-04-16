# Local Runbook (Atualizado)

## Pré-requisitos
- Node.js 25.x
- MongoDB local na porta 27017
- Redis local na porta 6379
- MinIO e GeoServer (opcional para testes completos de GIS, o MapLibre local usa camadas dinâmicas)

## Configuração do Ambiente (.env)
A configuração falhava se rodasse o npm em background porque ele herdava variáveis shell globais. Certifique-se de usar este arquivo `.env` no **root do projeto**, bem como em `apps/api/` e `apps/web/`:

```env
MONGO_URL=mongodb://localhost:27017/flydea
JWT_SECRET=super-secret-change
CORS_ORIGIN=http://localhost:3000
WEB_URL=http://localhost:3000
GEOSERVER_PUBLIC_URL=http://localhost:8080/geoserver
GEOSERVER_URL=http://localhost:8080/geoserver
GEOSERVER_USER=admin
GEOSERVER_PASSWORD=geoserver
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=flydea-geotiffs
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Start Up Rápido
Criei um script `start.sh` para rodar tudo no background forçando as variáveis:

```bash
chmod +x start.sh
./start.sh
```

Acompanhe os logs via `api.log` e `web.log`.

## URLs
- Frontend: `http://localhost:3000`
- Backend Health: `http://localhost:4000/health`
- Backend Swagger: `http://localhost:4000/docs`

## Credenciais Seed (Demo)
- Usuário: `admin@demo.local`
- Senha: `Admin@12345`
- Tenant: `demo`