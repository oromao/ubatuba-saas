# PGV Fiscal Simulation

## O que foi entregue
- Tela de simulação em `PGV > Relatório`.
- Montagem de cenário por `projectId`, zona, face, bairro, logradouro, uso e padrão construtivo.
- Comparativo entre valor venal atual e proposto.
- Impacto estimado de arrecadação.
- Listagem dos imóveis afetados.
- Quebra territorial por zona, bairro, via e uso.
- Exportação em CSV para evidência e repasse.

## Leitura de produto
O módulo agora faz o que uma Fazenda espera de uma PGV competitiva: sair do cadastro e entrar na simulação de decisão.

## Observação técnica
O cálculo usa os valores já disponíveis do CTM/PGV e multiplica por cenários propostos. A qualidade final depende da consistência do cadastro-base e da calibração dos multiplicadores.
