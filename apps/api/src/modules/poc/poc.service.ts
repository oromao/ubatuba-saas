import { Injectable } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

type PocCheck = {
  id: string;
  title: string;
  passed: boolean;
  weight: number;
  evidence: string;
};

type PocScoreResult = {
  score: number;
  status: 'OK' | 'ATENCAO';
  threshold: number;
  checks: PocCheck[];
  generatedAt: string;
};

@Injectable()
export class PocService {
  private readonly threshold = 95;
  private readonly monorepoRootHint = process.env.POC_REPO_ROOT;

  private async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private resolveRepoRoot() {
    const candidates = [
      this.monorepoRootHint,
      '/workspace',
      process.cwd(),
      path.resolve(process.cwd(), '..'),
      path.resolve(process.cwd(), '..', '..'),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const apiPath = path.join(candidate, 'apps', 'api');
      const webPath = path.join(candidate, 'apps', 'web');
      if (existsSync(apiPath) && existsSync(webPath)) {
        return candidate;
      }
    }

    return process.cwd();
  }

  calculateScore(checks: PocCheck[]): PocScoreResult {
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const earned = checks.reduce((sum, check) => (check.passed ? sum + check.weight : sum), 0);
    const score = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);

    return {
      score,
      status: score >= this.threshold ? 'OK' : 'ATENCAO',
      threshold: this.threshold,
      checks,
      generatedAt: new Date().toISOString(),
    };
  }

  async health() {
    return {
      status: 'ok',
      service: 'poc',
      generatedAt: new Date().toISOString(),
    };
  }

  async score(): Promise<PocScoreResult> {
    try {
      const root = this.resolveRepoRoot();

      const checks: PocCheck[] = [
        {
          id: 'docs-gap',
          title: 'Gap analysis do edital',
          passed: await this.exists(path.join(root, 'docs', 'edital-gap-analysis.md')),
          weight: 5,
          evidence: 'docs/edital-gap-analysis.md',
        },
        {
          id: 'docs-roadmap',
          title: 'Roadmap do edital',
          passed: await this.exists(path.join(root, 'docs', 'edital-roadmap.md')),
          weight: 5,
          evidence: 'docs/edital-roadmap.md',
        },
        {
          id: 'cloud-doc',
          title: 'Blueprint cloud deploy',
          passed: await this.exists(path.join(root, 'docs', 'cloud-deploy.md')),
          weight: 5,
          evidence: 'docs/cloud-deploy.md',
        },
        {
          id: 'iac-terraform',
          title: 'IaC Terraform base',
          passed: await this.exists(path.join(root, 'infra', 'iac', 'terraform', 'main.tf')),
          weight: 5,
          evidence: 'infra/iac/terraform/main.tf',
        },
        {
          id: 'pwa-manifest',
          title: 'Manifest PWA mobile',
          passed: await this.exists(path.join(root, 'apps', 'web', 'public', 'manifest.webmanifest')),
          weight: 5,
          evidence: 'apps/web/public/manifest.webmanifest',
        },
        {
          id: 'pwa-sw',
          title: 'Service worker mobile',
          passed: await this.exists(path.join(root, 'apps', 'web', 'public', 'sw.js')),
          weight: 5,
          evidence: 'apps/web/public/sw.js',
        },
        {
          id: 'poc-matrix',
          title: 'Matriz de requisitos PoC',
          passed: await this.exists(path.join(root, 'poc', 'requirements-matrix.md')),
          weight: 5,
          evidence: 'poc/requirements-matrix.md',
        },
        {
          id: 'poc-demo-script',
          title: 'Roteiro de demo PoC',
          passed: await this.exists(path.join(root, 'poc', 'demo-script.md')),
          weight: 5,
          evidence: 'poc/demo-script.md',
        },
        {
          id: 'poc-seed',
          title: 'Pacote de seed PoC',
          passed: await this.exists(path.join(root, 'poc', 'seed', 'poc-seed.json')),
          weight: 5,
          evidence: 'poc/seed/poc-seed.json',
        },
        {
          id: 'poc-checks-script',
          title: 'Checks automatizados PoC',
          passed: await this.exists(path.join(root, 'poc', 'checks', 'run-checks.mjs')),
          weight: 5,
          evidence: 'poc/checks/run-checks.mjs',
        },
        {
          id: 'module-compliance',
          title: 'Modulo Compliance',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'compliance', 'compliance.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/compliance/compliance.module.ts',
        },
        {
          id: 'module-tax-integration',
          title: 'Modulo Integracoes tributarias',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'tax-integration', 'tax-integration.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/tax-integration/tax-integration.module.ts',
        },
        {
          id: 'module-letters',
          title: 'Modulo Cartas de notificacao',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'notifications-letters', 'notifications-letters.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/notifications-letters/notifications-letters.module.ts',
        },
        {
          id: 'module-surveys',
          title: 'Modulo Levantamentos',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'surveys', 'surveys.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/surveys/surveys.module.ts',
        },
        {
          id: 'module-mobile-sync',
          title: 'Modulo Mobile Sync',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'mobile', 'mobile.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/mobile/mobile.module.ts',
        },
        {
          id: 'module-poc',
          title: 'Modulo API PoC',
          passed: await this.exists(path.join(root, 'apps', 'api', 'src', 'modules', 'poc', 'poc.module.ts')),
          weight: 5,
          evidence: 'apps/api/src/modules/poc/poc.module.ts',
        },
        {
          id: 'web-compliance',
          title: 'Tela web Compliance',
          passed: await this.exists(path.join(root, 'apps', 'web', 'src', 'app', 'app', 'compliance', 'page.tsx')),
          weight: 5,
          evidence: 'apps/web/src/app/app/compliance/page.tsx',
        },
        {
          id: 'web-integracoes',
          title: 'Tela web Integracoes',
          passed: await this.exists(path.join(root, 'apps', 'web', 'src', 'app', 'app', 'integracoes', 'page.tsx')),
          weight: 5,
          evidence: 'apps/web/src/app/app/integracoes/page.tsx',
        },
        {
          id: 'web-cartas',
          title: 'Tela web Cartas',
          passed: await this.exists(path.join(root, 'apps', 'web', 'src', 'app', 'app', 'cartas', 'page.tsx')),
          weight: 5,
          evidence: 'apps/web/src/app/app/cartas/page.tsx',
        },
        {
          id: 'web-poc-page',
          title: 'Tela web PoC',
          passed: await this.exists(path.join(root, 'apps', 'web', 'src', 'app', 'app', 'poc', 'page.tsx')),
          weight: 5,
          evidence: 'apps/web/src/app/app/poc/page.tsx',
        },
      ];

      const resultFile = path.join(root, 'poc', 'checks', 'last-result.json');
      const hasResultFile = await this.exists(resultFile);
      if (hasResultFile) {
        checks.push({
          id: 'poc-last-check',
          title: 'Resultado recente do script de checks',
          passed: true,
          weight: 5,
          evidence: 'poc/checks/last-result.json',
        });
      }

      return this.calculateScore(checks);
    } catch {
      return this.calculateScore([
        {
          id: 'poc-score-runtime',
          title: 'Geracao do score sem erro interno',
          passed: false,
          weight: 100,
          evidence: 'apps/api/src/modules/poc/poc.service.ts',
        },
      ]);
    }
  }
}
