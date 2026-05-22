# FlyDea — AI Agent Start Here

GovTech SaaS multi-tenant municipal (GIS + CTM + tributação).

## Startup Sequence

Read in order at session start:
1. `.ai/harness-operating-contract.md`
2. `.ai/context-compact.md`
3. `.ai/current-task.md`
4. `.ai/backlog.index.md`
5. `.ai/risks.index.md`
6. `.ai/business-context.index.md`
7. `.ai/tools/command-policy.md`

## Token Economy
- Compact context first, targeted inspection second
- Never scan entire repo by default
- Expand only when the task requires it

## Harness Guardrails
- `.ai/guardrails/govtech-guardrails.md`
- `.ai/guardrails/terraform-guardrails.md`
- `.ai/guardrails/security-guardrails.md`

## Safety Rules
- Never execute DESTRUCTIVE commands without human approval
- Never delete — archive to `.archive/YYYY-MM-DD/`
- Existence ≠ working — prove with tests

## End of Task
- Update `.ai/current-task.md`
- Update `.ai/backlog.index.md`
- Append to `.docs/planning/04-PROGRESS-LOG.md`
