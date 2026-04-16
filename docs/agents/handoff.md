# Handoff Report: FlyDea VPS Deployment + SP Layers Import
- **Target App/Module:** apps/api (layers) + apps/web (map)
- **Objetivo Atual:** Deploy produção na VPS + Importar camadas zoneamento São Paulo GeoSampa
- **Modificações Aplicadas (Done):**
  1. Backend: Adicionado método importSpZoneamentoLayers() com ~80 camadas GeoSampa
  2. Backend: Adicionado endpoint POST /layers/import-sp-zoneamento
  3. Frontend: Alterado centro do mapa para São Paulo [-46.6333, -23.5505]
  4. Deploy: Sincronizado código para VPS 172.233.188.166, buildado e startado containers
  5. Importado 65 camadas SP para o banco MongoDB
- **Validações Pendentes (To-do):**
  - Verificar se camadas aparecem no painel "Camadas GIS" do mapa
  - Verificar se GeoJSON externo carrega (possível problema CORS com nucleo-digital.github.io)
- **Riscos Conhecidos:** URLs do GitHub Pages podem ter CORS bloqueado
- **Próximos Passos (Next Instruction):** Recarregar mapa, verificar consola browser para erros network

---

# Contexto Completo para Qwen

## Credenciais
```
VPS SSH: root@172.233.188.166 / Romao@030520001
MongoDB: mongodb://root:rootpass@172.233.188.166:27017/flydea
Login: admin@ubatuba.local / Admin@123456 / tenant: ubatuba
```

## Serviços
- Web: http://172.233.188.166:3000
- API: http://172.233.188.166:4000

## Importar Camadas (se necessário)
```bash
TOKEN=$(curl -s http://172.233.188.166:4000/auth/login \
  -X POST -H 'Content-Type: application/json' \
  -d '{"email":"admin@ubatuba.local","password":"Admin@123456","tenantSlug":"ubatuba"}' \
  | jq -r '.data.accessToken')

curl -s -X POST http://172.233.188.166:4000/layers/import-sp-zoneamento \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Debug
```bash
# Ver camadas no banco
docker exec flydea-mongodb-1 mongosh -u root -p rootpass --authenticationDatabase admin flydea --eval 'db.layers.find({group: "Zoneamento SP"}).count()'

# Ver logs
docker logs -f flydea-web-1
```

## Arquivos Modificados
- apps/api/src/modules/layers/layers.service.ts
- apps/api/src/modules/layers/layers.controller.ts
- apps/web/src/app/app/maps/map-view.tsx
- apps/web/src/components/maps/MiniMap.tsx