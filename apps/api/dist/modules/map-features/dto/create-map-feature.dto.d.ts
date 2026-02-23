import { PolygonGeometry } from '../../../common/utils/geo';
import { MapFeatureType } from '../map-feature.schema';
export declare class CreateMapFeatureDto {
    projectId?: string;
    featureType: MapFeatureType;
    properties?: Record<string, unknown>;
    geometry: PolygonGeometry;
}
