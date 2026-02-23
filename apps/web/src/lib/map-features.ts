import type { FeatureCollection as GeoFeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { apiFetch } from "./api";

export type MapFeatureType = "parcel" | "building";

export type MapFeature = {
  id: string;
  tenantSlug?: string;
  projectSlug?: string;
  featureType: MapFeatureType;
  properties?: Record<string, unknown>;
  geometry: Geometry;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export type MapFeatureCollection = GeoFeatureCollection<Geometry, GeoJsonProperties>;

export const buildMapFeaturesGeojsonUrl = (
  type?: MapFeatureType,
  bbox?: string,
  projectId?: string,
) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (bbox) params.set("bbox", bbox);
  if (projectId) params.set("projectId", projectId);
  const suffix = params.toString();
  return `/map-features/geojson${suffix ? `?${suffix}` : ""}`;
};

export async function fetchMapFeaturesGeojson(
  type: MapFeatureType,
  bbox: string,
  projectId?: string,
) {
  return apiFetch<MapFeatureCollection>(buildMapFeaturesGeojsonUrl(type, bbox, projectId));
}

export async function createMapFeature(payload: {
  featureType: MapFeatureType;
  geometry: Geometry;
  properties?: Record<string, unknown>;
  projectId?: string;
}) {
  return apiFetch<MapFeature>("/map-features", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMapFeature(
  id: string,
  payload: { geometry?: Geometry; properties?: Record<string, unknown> },
) {
  return apiFetch<MapFeature>(`/map-features/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMapFeature(id: string) {
  return apiFetch<{ success: boolean }>(`/map-features/${id}`, {
    method: "DELETE",
  });
}
