# Guia SaaS Ubatuba (Ponta a Ponta)

Este guia cobre o uso completo do SaaS de Ubatuba: setup, login, navegacao por modulos e fluxo REURB ate gerar entregaveis.

## 1. Subir ambiente

1. No projeto:
```bash
cd /Users/paulo/ubatuba-saas
```

2. Criar `.env`:
```bash
cp .env.example .env
```

3. Subir stack:
```bash
docker compose up --build
```

4. URLs principais:
- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Swagger: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`
- GeoServer: `http://localhost:8080/geoserver`
- MinIO Console: `http://localhost:9001`

## 2. Login

Credenciais demo:
- Email: `admin@demo.local`
- Senha: `Admin@12345`
- Tenant slug: `demo`

Passos:
1. Abrir `http://localhost:3000/login`
2. Informar email/senha/tenant slug
3. Entrar no painel `/app/dashboard`

## 3. Perfis e acesso

Perfis suportados:
- `ADMIN`
- `GESTOR`
- `OPERADOR`
- `LEITOR`

Principio de acesso:
- Modulos operacionais (CTM/PGV/REURB/compliance etc.) liberados para `ADMIN`, `GESTOR`, `OPERADOR`
- `LEITOR` com perfil de consulta

## 4. Mapa de modulos no menu

### 4.1 Dashboard
- Visao executiva de indicadores

### 4.2 Mapas & Drones
- Camadas geograficas
- Visualizacao territorial

### 4.3 Levantamentos
- Upload de arquivos tecnicos
- Pipeline e QA
- Publicacao de levantamento

### 4.4 CTM
- Parcelas
- Logradouros
- Mobiliario
- Pendencias cadastrais e historico

### 4.5 PGV
- Zonas
- Faces
- Fatores
- Relatorio e exportacoes

### 4.6 Operacao
- Alertas
- Processos
- Ativos
- Integracoes
- Cartas
- Compliance

### 4.7 REURB (novo)
- Configuracao por tenant (`tenantConfig`)
- Cadastro tabulado de familias
- Controle de pendencias documentais
- Geracao de planilha sintese
- Exportacao CSV/XLSX do banco tabulado
- Geracao de pacote ZIP para cartorio

## 5. Fluxo REURB completo (obrigatorio)

## 5.1 Ativar REURB no tenant

1. Abrir `/app/reurb`
2. Clicar em `Ativar REURB`

Opcional por API:
```bash
curl -X PUT "http://localhost:4000/reurb/tenant-config" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "reurbEnabled": true,
    "requiredFamilyFields": ["familyCode", "nucleus", "responsibleName", "cpf", "status"],
    "spreadsheet": {
      "templateVersion": "ubatuba-v1",
      "columns": [
        {"key":"familyCode","label":"CODIGO_FAMILIA","required":true},
        {"key":"nucleus","label":"NUCLEO","required":true},
        {"key":"responsibleName","label":"RESPONSAVEL","required":true},
        {"key":"cpf","label":"CPF","required":true},
        {"key":"status","label":"STATUS","required":true}
      ]
    }
  }'
```

## 5.2 Cadastrar familias beneficiarias

Via tela `/app/reurb`:
1. Preencher `Codigo da familia`, `Nucleo`, `Responsavel`, `CPF`
2. Clicar `Cadastrar familia`

Via API:
```bash
curl -X POST "http://localhost:4000/reurb/families" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "familyCode": "FAM-001",
    "nucleus": "Nucleo Centro",
    "responsibleName": "Maria Silva",
    "cpf": "12345678900",
    "status": "PENDENTE"
  }'
```

## 5.3 Registrar pendencias documentais

Campos:
- tipo de documento
- documento faltante
- prazo
- status
- observacao
- responsavel

API:
```bash
curl -X POST "http://localhost:4000/reurb/pendencies" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "nucleus": "Nucleo Centro",
    "documentType": "RG",
    "missingDocument": "RG frente",
    "dueDate": "2026-03-10",
    "responsible": "Equipe Social",
    "status": "ABERTA"
  }'
```

Atualizacao de status:
```bash
curl -X PATCH "http://localhost:4000/reurb/pendencies/<PENDENCY_ID>/status" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVIDA","observation":"Documento validado"}'
```

## 5.4 Upload de documentos por familia

1. Solicitar URL assinada:
```bash
curl -X POST "http://localhost:4000/reurb/documents/presign-upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "familyId":"<FAMILY_ID>",
    "documentType":"RG",
    "fileName":"rg-frente.pdf",
    "mimeType":"application/pdf"
  }'
```

2. Fazer upload no `url` retornado
3. Confirmar upload no sistema:
```bash
curl -X POST "http://localhost:4000/reurb/documents/complete-upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "familyId":"<FAMILY_ID>",
    "documentType":"RG",
    "key":"<KEY_RETORNADA>",
    "fileName":"rg-frente.pdf",
    "status":"APROVADO"
  }'
```

## 5.5 Gerar entregaveis

### Planilha sintese (XLSX)
Tela: botao `Gerar Planilha Sintese` em `/app/reurb`

API:
```bash
curl -X POST "http://localhost:4000/reurb/planilha-sintese/generate" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Banco tabulado
- CSV: `POST /reurb/families/export.csv`
- XLSX: `POST /reurb/families/export.xlsx`
- JSON: `POST /reurb/families/export.json`

### Pacote cartorio (ZIP)
```bash
curl -X POST "http://localhost:4000/reurb/cartorio/package" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Estrutura padrao do ZIP:
- `/familias/`
- `/planilha/`
- `/titulos/`
- `/documentos_aprovados/`

## 6. Validacoes de conformidade (antes de gerar)

Geracao e bloqueada quando houver:
1. `reurbEnabled=false`
2. Sem familias cadastradas
3. Campos obrigatorios ausentes
4. Pendencias abertas (se configurado)
5. Familias fora de `APTA` (quando regra exigir)

Erros retornam estruturados em `errors[]` e tentativa fica auditada.

## 7. Baixar entregaveis

1. Listar:
```bash
curl -X GET "http://localhost:4000/reurb/deliverables" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>"
```

2. Gerar link de download:
```bash
curl -X GET "http://localhost:4000/reurb/deliverables/<DELIVERABLE_ID>/download" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>"
```

## 8. Checklist rapido de teste ponta a ponta

1. Fazer login no tenant
2. Ativar REURB
3. Cadastrar 2 familias
4. Criar 1 pendencia aberta
5. Tentar gerar planilha (esperado: bloqueio)
6. Resolver pendencia
7. Gerar planilha e CSV
8. Fazer upload de doc aprovado
9. Gerar pacote ZIP cartorio
10. Auditar acessos LGPD: `GET /reurb/audit?projectId=<ID>&limit=200`
10. Baixar entregaveis e validar hash/estrutura

## 9. Referencias internas

- Configuracao tenant: `/Users/paulo/ubatuba-saas/docs/tenant-ubatuba.md`
- API docs: `http://localhost:4000/docs`
