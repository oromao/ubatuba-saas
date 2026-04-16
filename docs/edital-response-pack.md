# Edital Response Pack

## Aderência por domínio
- CTM: forte, com cadastro, mapa, histórico e leitura territorial.
- PGV: forte, com valuation e cruzamento com observatório.
- Certidões: atende, com emissão e validação pública.
- Processos: parcial, com estrutura digital e vínculo documental.
- Monitoramento territorial: parcial, com triagem, atribuição e encerramento.
- Mobile offline: melhorado, com fila local, evidencias, status e sync.
- Portal coexistente: parcial, com exchange assinado e deep links.
- Portal institucional: homologação OIDC-ready com authorize/callback.
- Dashboard executivo: forte, com layout persistido por usuário.
- 156: apoio modular, com protocolo, histórico, anexos e status operacionais.
- Ambiental: apoio modular, com tarefas, laudo, evidências e encerramento.
- Obras públicas: apoio modular, com etapa, medição, evidência e progresso.
- Cemitério: apoio modular, com ocupação, reserva, manutenção e documentos.

## Evidências técnicas
- Tela: `/app/dashboard`, `/app/observatorio`, `/app/mobile`, `/app/integracoes`, `/portal/exchange`, `/portal/oidc/start`
- API: `/dashboard/layout`, `/observatory/market`, `/monitoring/dashboard`, `/auth/portal/exchange`, `/integration-hub/portal-link`, `/auth/oidc/authorize`
- Testes: auth, integration hub, monitoring, dashboard, mobile
- Testes: citizen-156, environment, public-works, cemetery

## O que responder em banca
- Portal: a solução já convive com portal existente via deep link assinado e handoff de sessão; integração formal com IdP pode ser acoplada sem reescrever o core.
- Portal: a solução já convive com portal existente via handoff assinado e agora também expõe um fluxo OIDC-ready de homologação.
- Offline: o fiscal trabalha offline com fila local, tentativa de sync e status por registro.
- Monitoramento: o fluxo de alerta já existe do evento até o desfecho.
- Auditoria: os módulos críticos carregam trilha, tenant e RBAC.
- Integração: o hub centraliza adapters e evita duplicar serviços municipais.
- Satélites: 156, ambiental, obras públicas e cemitério entram como módulos de apoio com resumo operacional e ação de backoffice; não devem ser vendidos como o núcleo diferencial da proposta.

## Roteiro de demo
1. Login.
2. Dashboard executivo com widget persistido.
3. Observatório com comparação e discrepâncias.
4. CTM e mapa.
5. Portal coexistente via exchange.
6. Mobile offline com sync.
7. Monitoramento e desfecho.

## Diferenciais competitivos
- narrativa mais clara de coexistência institucional
- demo mais curta e integrada
- operação de campo com status visível
- observatório com leitura executiva e territorial
- satélites com leitura operacional mínima crível, sem parecer casca estática

## Posicionamento honesto dos módulos satélite
- Devem aparecer como prova de cobertura modular.
- Não devem entrar antes de CTM, PGV, observatório, monitoramento, certidões e mobile.
- Se a banca pressionar profundidade, trate-os como módulos de apoio já funcionais, porém não tão maduros quanto o núcleo.
