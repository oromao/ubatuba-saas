# GovTech Guardrails — FlyDea

## Princípios
1. Dado público é público, dado do cidadão é protegido (LGPD)
2. Isolamento multi-tenant é requisito de segurança, não feature
3. Processos fiscais e tributários requerem trilha de auditoria
4. Transparência e rastreabilidade são obrigatórias (LAI)

## Regras
- Nunca expor dados de um tenant em outro
- Nunca logar dados pessoais (CPF, endereço, telefone) em texto puro
- Toda mutação em dados fiscais/tributários deve ser auditada
- Migrações de banco devem ser reversíveis
- Testes com dados reais devem usar ambiente isolado

## LGPD
- Dados de contribuintes = dados pessoais
- Coleta mínima necessária
- Direito de exclusão/exclusão lógica
- Registro de consentimento quando aplicável
