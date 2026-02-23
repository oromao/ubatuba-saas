export declare class MetricsService {
    private readonly registry;
    constructor();
    getMetrics(): Promise<string>;
    getContentType(): "text/plain; version=0.0.4; charset=utf-8";
}
