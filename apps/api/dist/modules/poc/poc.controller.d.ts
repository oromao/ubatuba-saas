import { PocService } from './poc.service';
export declare class PocController {
    private readonly service;
    constructor(service: PocService);
    health(): Promise<{
        status: string;
        service: string;
        generatedAt: string;
    }>;
    score(): Promise<{
        score: number;
        status: "OK" | "ATENCAO";
        threshold: number;
        checks: {
            id: string;
            title: string;
            passed: boolean;
            weight: number;
            evidence: string;
        }[];
        generatedAt: string;
    }>;
}
