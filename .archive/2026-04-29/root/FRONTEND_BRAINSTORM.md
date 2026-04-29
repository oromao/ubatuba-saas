# Brainstorming & Veredito do Frontend (FlyDea Atlas SaaS)

## Veredito Brutalmente Honesto
O frontend apresenta uma base técnica sólida e moderna (Next.js App Router, Tailwind, React Query, Zustand, shadcn/ui), com uma arquitetura bem definida. As páginas de aterrissagem (Home e Login) são excelentes, oferecem uma ótima narrativa comercial e transmitem maturidade. O uso de persistência local, PWA para mobile offline-first e `useMutation` para interações é de nível sênior.

**Contudo, o produto sofre de uma grave "Síndrome de MVP/Hackathon" nas camadas operacionais internas.** 

O maior ofensor para a percepção de maturidade (P0) é a **inconsistência ortográfica gritante**. Módulos inteiros (Monitoramento, Observatório, CTM, PGV, Dashboard, Mobile) foram escritos omitindo acentuação ("Gestao", "Construcao", "Atribuicao", "Integrações" vs "Discrepancias"), enquanto outros (Obras Públicas, Cemitério, Alvarás) estão corretos. Isso quebra a "Executive Legibility" e faz a demo parecer um rascunho de engenharia, não um SaaS Enterprise para prefeituras.

Além disso, os módulos centrais do sistema (CTM e PGV) são, no momento, apenas **"cascas" (thin wrappers)**. Eles não possuem cabeçalhos estruturados, cards de resumo, nem a mesma linguagem visual dos outros módulos. O CTM, sendo o coração de um sistema de geointeligência municipal, deveria ser a estrela da demo, mas hoje é uma tabela nua.

### Teto Atual
O teto atual do produto não é 10/10. É um 7.5/10. 
Para chegar a 9/10, precisamos sanar as inconsistências ortográficas, elevar o CTM/PGV ao padrão visual do restante do app e garantir estados vazios decentes. O último quilômetro para o 10/10 exigiria dashboards visuais (gráficos reais, não apenas métricas isoladas) e o componente de mapa (MapLibre) totalmente integrado nestas telas.

---

## Mapa do Frontend & Classificação

| Módulo | Status Qualidade | Ação Recomendada |
|--------|------------------|------------------|
| `/` (Home) | 10/10 | Preservar. Narrativa forte. |
| `/login` | 9/10 | Preservar. Ótima UX. |
| `/app/dashboard` | 8/10 | Corrigir acentos ("Saude", "modulos"). UI robusta. |
| `/app/observatorio` | 7/10 | Corrigir acentos ("Discrepancias", "Avaliacoes"). UI muito densa, mas funcional. |
| `/app/monitoramento` | 7/10 | Corrigir acentos ("Ingestao", "evidencia"). Faltam empty states atraentes. |
| `/app/ambiental` | 7/10 | Corrigir acentos ("Gestao", "servico"). |
| `/app/156` | 7/10 | Corrigir acentos ("Titulo", "Historico"). |
| `/app/mobile` | 8/10 | Excelente base técnica offline. Corrigir acentos ("Geolocalizacao", "Endereco"). |
| `/app/integracoes` | 8/10 | UI boa, corrigir linguagem ("Integrações" está OK, mas checar resto). |
| `/app/obras-publicas` | 9/10 | Bom uso de acentos e UI. |
| `/app/cemiterio` | 9/10 | Bom uso de acentos e UI. |
| `/app/empresas` | 9/10 | Bom uso de acentos e UI. |
| `/app/certidoes` | 8/10 | Cuidado com renderização no cliente, mas UI e acentos bons. |
| `/app/ctm/*` | 4/10 (Casca) | Elevar UI. Faltam headers, cards de resumo e acentos. |
| `/app/pgv/*` | 4/10 (Casca) | Elevar UI. Faltam headers e acentos. |

---

## Plano de Ação Priorizado

### P0: "Executive Legibility" (Legibilidade e Percepção de Maturidade)
* O que: Varredura total para correção de ortografia e acentuação no Dashboard, Observatório, Monitoramento, Ambiental, 156, Mobile, CTM e PGV.
* Por que: Demonstrações para prefeitos e secretários morrem se o sistema parece quebrado ortograficamente.

### P1: Elevação do CTM e PGV
* O que: Reescrever os arquivos de `ctm` e `pgv` para usarem a estrutura de `Card`, `Badge` de prioridade, `CardTitle` e `CardDescription`.
* Por que: São módulos centrais. Precisam parecer tão maduros quanto as páginas de Obras ou Cemitério.

### P2: Consistência de Headers e Empty States
* O que: Garantir que todas as páginas tenham o padrão `<div className="flex items-center justify-between">` com título e subtítulo claro.

---

Vou executar as fases P0 e P1 agora mesmo via código.
