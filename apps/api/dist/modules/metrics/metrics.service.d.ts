export declare class MetricsService {
    private readonly registry;
    private readonly httpRequestsTotal;
    private readonly httpRequestDurationMs;
    private readonly errorsTotal;
    constructor();
    recordRequest(method: string, path: string, status: number, durationMs: number): void;
    getMetrics(): Promise<string>;
    getContentType(): "text/plain; version=0.0.4; charset=utf-8";
}
