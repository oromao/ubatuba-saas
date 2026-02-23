# Tenant REURB (Ubatuba)

## Como ativar
1. Entrar no tenant alvo e abrir a tela `REURB` (`/app/reurb`) ou chamar `PUT /reurb/tenant-config`.
2. Definir:
   - `reurbEnabled=true`
   - `requiredFamilyFields`
   - `spreadsheet.templateVersion`
   - `spreadsheet.columns`
   - `documentNaming`
   - `validationRules`
3. Salvar configuracao e validar com `GET /reurb/tenant-config`.

Exemplo de payload:

```json
{
  "reurbEnabled": true,
  "requiredFamilyFields": ["familyCode", "nucleus", "responsibleName", "cpf", "status"],
  "spreadsheet": {
    "templateVersion": "ubatuba-v1",
    "columns": [
      { "key": "familyCode", "label": "CODIGO_FAMILIA", "required": true },
      { "key": "nucleus", "label": "NUCLEO", "required": true },
      { "key": "responsibleName", "label": "RESPONSAVEL", "required": true },
      { "key": "cpf", "label": "CPF", "required": true },
      { "key": "status", "label": "STATUS", "required": true }
    ]
  },
  "documentNaming": {
    "familyFolder": "familias",
    "spreadsheetFolder": "planilha",
    "titlesFolder": "titulos",
    "approvedDocumentsFolder": "documentos_aprovados",
    "requiredDocumentTypes": ["RG", "CPF", "COMPROVANTE_RESIDENCIA"]
  },
  "validationRules": {
    "blockOnPendingDocumentIssues": true,
    "requireAptaStatusForExports": false,
    "requireAptaStatusForCartorioPackage": true,
    "failOnMissingRequiredFields": true
  }
}
```

## Como gerar planilha sintese
1. Garantir familias cadastradas em `POST /reurb/families`.
2. Garantir conformidade (sem erros bloqueantes).
3. Executar `POST /reurb/planilha-sintese/generate`.
4. Baixar em `GET /reurb/deliverables/:id/download`.

## Como gerar pacote de cartorio
1. Registrar documentos por familia:
   - `POST /reurb/documents/presign-upload`
   - upload no objeto assinado
   - `POST /reurb/documents/complete-upload`
2. Marcar documentos aprovados (`status=APROVADO`) e resolver pendencias.
3. Executar `POST /reurb/cartorio/package`.
4. O ZIP sera gerado com estrutura parametrizavel e hash `sha256`.

## Estrutura de dados exigida
### Familias (`reurb_families`)
- `familyCode`, `nucleus`, `responsibleName`, `status`
- `cpf`, `address`, `membersCount`, `monthlyIncome`
- `data` (campos extras por municipio/tenant)
- `documents[]` (metadados + versionamento)

### Pendencias (`reurb_document_pendencies`)
- `documentType`, `missingDocument`, `dueDate`, `status`, `observation`, `responsible`
- `nucleus` e opcionalmente `familyId`
- `statusHistory[]` para auditoria

### Entregaveis (`reurb_deliverables`)
- `kind`, `version`, `fileName`, `key`, `hashSha256`, `generatedBy`, `generatedAt`

## Regras de validacao
As validacoes sao obrigatorias antes de:
- gerar planilha sintese
- exportar banco tabulado
- gerar pacote cartorio

Bloqueios aplicados:
1. `reurbEnabled` desligado.
2. Sem familias cadastradas.
3. Campo obrigatorio faltante (`requiredFamilyFields` e colunas obrigatorias da planilha).
4. Pendencia documental aberta (`status != RESOLVIDA`) quando `blockOnPendingDocumentIssues=true`.
5. Familia fora de `APTA` quando o fluxo exigir aptidao (`requireAptaStatusFor...`).

Tentativas aprovadas e bloqueadas sao registradas em `reurb_audit_logs`.
