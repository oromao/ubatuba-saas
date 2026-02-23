type PublishRasterInput = {
    workspace: string;
    store: string;
    layerName: string;
    fileBuffer: Buffer;
};
export declare class GeoserverPublisherService {
    private baseUrl;
    private authHeader;
    private geoserverRequest;
    ensureWorkspace(workspace: string): Promise<void>;
    publishGeoTiff(input: PublishRasterInput): Promise<void>;
}
export {};
