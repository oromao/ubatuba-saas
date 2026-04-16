#!/bin/bash
export MONGO_URL=mongodb://localhost:27017/flydea
export REDIS_URL=redis://localhost:6379
export GEOSERVER_URL=http://localhost:8080/geoserver
export MINIO_ENDPOINT=http://localhost:9000
export NEXT_PUBLIC_API_URL=http://localhost:4000
export CORS_ORIGIN=http://localhost:3000
export WEB_URL=http://localhost:3000
nohup npm run dev -w apps/api > api.log 2>&1 &
nohup npm run dev -w apps/web > web.log 2>&1 &
echo "Servers started via npm with local env vars"