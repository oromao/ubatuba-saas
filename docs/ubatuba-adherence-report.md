# Ubatuba Adherence Report

## Referência Pública de Ubatuba
Ubatuba possui um **Portal de Serviços (`servicos.ubatuba.sp.gov.br`)** funcional, que centraliza IPTU (guias, 2ª via), ITBI, certidões negativas e consultas de processos via SEI.
O município também demanda fortemente serviços de geoprocessamento vinculados a Secretarias de Fazenda, Urbanismo e Meio Ambiente.

## Aderência do FlyDea Atlas
- **Coexistência com portal de serviços:** ATENDE.
  O módulo de `Integracoes` foi projetado para atuar como um Hub. Isso significa que ele não precisa ser um substituto direto para a frente do cidadão. Ele atua perfeitamente no _backend_ governamental enquanto se federa (SSO) com o que Ubatuba já usa na ponta.

- **Serviços de 156, Processos e Protocolos:** ATENDE.
  O sistema contém as lógicas de tramitação com upload de evidências e auditoria, que conversam perfeitamente com os requisitos operacionais visíveis.

- **Validação pública de Certidões:** ATENDE.
  Exigência básica de transparência. O SaaS já gera hash SHA-256 de PDFs e mantém um endpoint e uma rota de consulta validadora pública para certidões.

- **CTM Integrado ao Cadastro Fiscal:** ATENDE.
  O CTM do FlyDea já não é apenas visual. Ele alimenta a PGV com recortes por zona, face, bairro e logradouro, e permite simulação de impacto fiscal com leitura territorial. A conexão com o ERP tributário externo continua dependente do manual do fornecedor, mas a inteligência interna para prova em banca já está exposta.

- **PGV Fazendária / Simulação Venal:** ATENDE.
  O sistema agora permite montar cenário, comparar valor venal atual versus proposto, estimar impacto de arrecadação e exportar o cenário. Isso atende diretamente a uma dor de Fazenda em edital: mostrar ganho fiscal com clareza executiva.

- **Alvarás de Obras e Empresas:** ATENDE.
  O fluxo agora exibe etapas, responsáveis, histórico, exigências, evidências e decisão final. Para a leitura de Urbanismo/Obras, isso já parece processo administrativo digital e não uma troca de status superficial.
