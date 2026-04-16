# Geopixel Public Gap Analysis

Objetivo: mapear a superfície pública da Geopixel contra o estado atual do FlyDea, priorizando aderência a Ubatuba.

## Veredito executivo
- `P0 Ubatuba`: o núcleo já é forte, mas ainda precisa formalização de alguns fluxos de processo, integração de portal cidadão e UX executiva consistente.
- `P1 Geopixel core`: CTM, PGV, alertas, REURB, levantamentos e mapas existem, porém vários itens públicos da Geopixel ainda estão parciais ou ausentes como domínios próprios.
- `P2 comercial`: o pacote executivo começou a existir com painéis por secretaria; ainda falta a camada analítica avançada e a personalização de widgets.

## Superfície pública Geopixel observada
Baseado em páginas públicas, Geopixel se posiciona com:
- Cadastro Técnico Multifinalitário
- Planta Genérica de Valores
- Monitoramento de Alterações Municipais
- Monitoramento de Eventos Ambientais
- Alvará Digital de Obras e Habite-se
- Aprovação Digital de Alvará de Empresas
- Observatório do Mercado Imobiliário
- Mobilidade em Campo
- Gestão e Licenciamento Ambiental
- Automatização de Certidão e Digitalização dos Processos
- Atendimento ao Cidadão 156
- Gestão de Cemitério
- Gestão de Obras Públicas
- discurso de governo digital integrado, observatório municipal e monitoramento contínuo do território

## Gap por domínio

### Já bem coberto ou próximo
- CTM: há módulos de parcelas, logradouros, mobiliário, mapa e histórico.
- PGV: há zonas, faces, fatores, versões e valuation/exportação.
- Levantamentos: há upload, QA e publicação de raster em GeoServer.
- REURB: há base forte de famílias, entregáveis e auditoria.
- Mapas: há visualização, desenho e camadas do tenant.

### Parcial
- Monitoramento de alterações municipais: existem alertas e geojson, mas falta pipeline completo de triagem/fiscalização/evidência/notificação/desfecho.
- Mobilidade em campo: existe app/rota, mas a operação offline e sincronização robusta ainda são parciais.
- Certidões/processos: há documentos e dossiês, mas falta motor de certidão pública e validação universal.
- Gestão ambiental: a base de alertas e geo está presente, mas não o workflow completo.
- Observatório municipal: dados existem, mas a camada executiva comparativa ainda é limitada.

### Ausente ou não comprovado
- Alvará digital de obras/habite-se.
- Alvará digital de empresas.
- Atendimento ao cidadão 156.
- Gestão de cemitério: agora existe um módulo operacional mínimo com jazigos, ocupação e documentos; ainda faltam mapa dedicado, integrações e relatórios completos.
- Gestão de obras públicas: agora há um domínio funcional mínimo, mas ainda faltam mapa executivo, indicadores e vínculo com medição/fiscalização por secretaria.
- Integrações externas reais com tributário, protocolo, INMET/INPE/CEMADEN, SSO municipal e portal cidadão.

## Critério Ubatuba
Para Ubatuba, o valor não está em “mapa bonito”; está em:
- CTM integrado ao cadastro fiscal
- workflows documentais e certidões
- monitoramento urbanístico e ambiental
- operação de campo
- integração com serviços já existentes no portal municipal

## Recomendação
1. Fechar P0 com integração e governança.
2. Estruturar P1 como domínios claros, mesmo que alguns sejam inicialmente “operational stubs”.
3. Adicionar P2 comercial só depois do núcleo estar vendável e demonstrável.
