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
export declare class PocService {
    private readonly threshold;
    private readonly monorepoRootHint;
    private exists;
    private resolveRepoRoot;
    calculateScore(checks: PocCheck[]): PocScoreResult;
    health(): Promise<{
        status: string;
        service: string;
        generatedAt: string;
    }>;
    score(): Promise<PocScoreResult>;
}
export {};
