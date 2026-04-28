import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parcel, ParcelDocument } from '../ctm/parcels/parcel.schema';
import { asObjectId } from '../../common/utils/object-id';
import * as vtpbf from 'vt-pbf';

// EPSG codes for São Paulo
const EPSG_WGS84 = 4326; // WGS84
const EPSG_UTM_23S = 31983; // UTM zone 23S (São Paulo)

// MVT configuration
const MVT_EXTENT = 4096;
const MVT_LAYER_NAME = 'parcels';
const MVT_LAYER_VERSION = 2;

export type Bbox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

export interface Coordinate {
  x: number;
  y: number;
}

export interface CoordinateTransformResult {
  fromEPSG: number;
  toEPSG: number;
  input: Coordinate;
  output: Coordinate;
}

export interface GisBboxQuery {
  tenantId: string;
  projectId: string;
  bbox: Bbox;
  limit?: number;
}

export interface GisBboxResult {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: any;
    properties: Record<string, any>;
  }>;
  total: number;
  limit: number;
}

@Injectable()
export class GisService {
  constructor(@InjectModel(Parcel.name) private readonly model: Model<ParcelDocument>) {}

  /**
   * Query parcels within a viewport bbox with strict limit for performance.
   * Uses MongoDB $geoIntersects with 2dsphere index.
   * Max limit: 1000 (configurable, defaults to 1000 for T6-SP-GIS-BBOX-VIEWPORT)
   */
  async queryBboxViewport(params: GisBboxQuery): Promise<GisBboxResult> {
    const { tenantId, projectId, bbox, limit = 1000 } = params;
    
    const [minLng, minLat, maxLng, maxLat] = bbox;
    
    // Build geoIntersects query for viewport
    const query = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [minLng, minLat],
                [minLng, maxLat],
                [maxLng, maxLat],
                [maxLng, minLat],
                [minLng, minLat],
              ],
            ],
          },
        },
      },
    };

    // Ensure limit does not exceed 1000 for viewport queries
    const safeLimit = Math.min(limit, 1000);

    const [features, total] = await Promise.all([
      this.model
        .find(query)
        .limit(safeLimit)
        .select('sqlu inscription geometry rawProperties centroid bbox status sourceType')
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const resultFeatures = features.map((p) => ({
      type: 'Feature' as const,
      id: String(p._id),
      geometry: p.geometry,
      properties: {
        sqlu: p.sqlu,
        inscription: p.inscription,
        status: p.status,
        sourceType: p.sourceType,
        centroid: p.centroid,
        bbox: p.bbox,
        ...p.rawProperties,
      },
    }));

    return {
      type: 'FeatureCollection',
      features: resultFeatures,
      total,
      limit: safeLimit,
    };
  }

  /**
   * Get bbox from coordinates for quick queries
   */
  getBboxFromCoordinates(coords: [number, number, number, number]): Bbox {
    return coords as Bbox;
  }

  /**
   * Convert coordinates between CRS systems.
   * Currently supports:
   * - WGS84 (EPSG:4326) <-> UTM 23S (EPSG:31983) for São Paulo
   * 
   * For UTM to WGS84: input is {x: easting, y: northing}
   * For WGS84 to UTM: input is {x: longitude, y: latitude}
   */
  transformCoordinate(
    input: Coordinate,
    fromEPSG: number,
    toEPSG: number,
  ): CoordinateTransformResult {
    let output: Coordinate;

    // UTM 23S (31983) -> WGS84 (4326)
    if (fromEPSG === EPSG_UTM_23S && toEPSG === EPSG_WGS84) {
      output = this.utmToWgs84(input.x, input.y, 23, true);
    }
    // WGS84 (4326) -> UTM 23S (31983)
    else if (fromEPSG === EPSG_WGS84 && toEPSG === EPSG_UTM_23S) {
      output = this.wgs84ToUtm(input.x, input.y, null, true);
    }
    // Same CRS - no transformation needed
    else if (fromEPSG === toEPSG) {
      output = { x: input.x, y: input.y };
    }
    // Unsupported conversion
    else {
      throw new Error(
        `CRS transformation not supported: from EURG:${fromEPSG} to EPSG:${toEPSG}. ` +
        `Supported: WGS84(4326) <-> UTM 23S(31983)`,
      );
    }

    return {
      fromEPSG,
      toEPSG,
      input: { x: input.x, y: input.y },
      output,
    };
  }

  /**
   * Transform an array of coordinates (for geometries)
   */
  transformCoordinates(
    coords: Coordinate[],
    fromEPSG: number,
    toEPSG: number,
  ): Coordinate[] {
    return coords.map((c) => this.transformCoordinate(c, fromEPSG, toEPSG).output);
  }

  /**
   * Calculate UTM zone from longitude
   * Zones 1-60, each 6 degrees wide, starting at -180
   */
  private calculateUtmZone(longitude: number): number {
    // UTM zones are 1-60, each covering 6 degrees of longitude
    // Zone 1: -180 to -174, Zone 2: -174 to -168, ..., Zone 60: 174 to 180
    const zoneFloat = (longitude + 180) / 6 + 1;
    return Math.floor(zoneFloat);
  }

  /**
   * Convert WGS84 (lon/lat) to UTM
   * Based on standard UTM conversion formulas
   */
  private wgs84ToUtm(longitude: number, latitude: number, zone: number | null, southernHemisphere: boolean): Coordinate {
    // Implementation based on standard UTM conversion
    // This is a simplified version - for production use proj4js or similar library
    
    const a = 6378137.0; // WGS84 semi-major axis
    const f = 1 / 298.257223563; // WGS84 flattening
    const k0 = 0.9996; // Scale factor
    
    // Calculate zone from longitude if not provided
    const calculatedZone = zone === null ? this.calculateUtmZone(longitude) : zone;
    
    const latRad = latitude * (Math.PI / 180);
    const lonRad = longitude * (Math.PI / 180);
    
    // Central meridian for zone
    const lon0 = (calculatedZone - 1) * 6 - 180 + 3;
    const lon0Rad = lon0 * (Math.PI / 180);
    
    const N = a / Math.sqrt(1 - (2 * f) + (f * f));
    const A = (lonRad - lon0Rad) * Math.cos(latRad);
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = ((f / (1 - f)) * (2 * T)) / (1 + T);
    const V = (N / (1 + T)) * (1 + C);
    
    // Calculate easting
    const M = this.meridionalArc(latRad, a, f);
    const easting = k0 * N * A + 500000.0;
    
    // Calculate northing
    let northing = k0 * (M + N * Math.tan(latRad) * ((A * A) / 2 + ((5 - T + 9 * C + 4 * C * C) * (A * A * A * A) / 24)));
    
    // Adjust for southern hemisphere
    if (southernHemisphere) {
      northing += 10000000.0;
    }
    
    return { x: Math.round(easting * 100) / 100, y: Math.round(northing * 100) / 100 };
  }

  /**
   * Helper for UTM conversion - calculate meridional arc
   */
  private meridionalArc(lat: number, a: number, f: number): number {
    const n = f / (2 - f);
    const A = a * (1 + n) * (1 + (n * n) / 4) * (1 + (n * n) / 64);
    const alpha = ['', '1/2', '-1/24', '-1/720', '-1/4480'];
    const beta = ['', '-1/2', '-1/24', '-1/720', '-1/4480'];
    
    let sum = 0;
    for (let i = 1; i <= 4; i++) {
      const term1 = (Math.sin(2 * i * lat)) * (n ** i);
      const term2 = parseFloat(alpha[i]) * (1 - (2 * i) * n + (4 * i * i - 1) * (n ** 2));
      sum += term1 * term2;
    }
    return A * (lat + sum);
  }

  /**
   * Convert UTM to WGS84 (simplified approximation)
   * For production accuracy, use proj4js
   */
  private utmToWgs84(easting: number, northing: number, zone: number, southernHemisphere: boolean): Coordinate {
    // Simplified approximation using inverse formulas
    // Note: Full inverse requires iterative solution
    
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const k0 = 0.9996;
    
    const centralMeridian = (zone - 1) * 6 - 180 + 3;
    const centralMeridianRad = centralMeridian * (Math.PI / 180);
    
    let northingAdj = northing;
    if (southernHemisphere) {
      northingAdj -= 10000000.0;
    }
    
    const x = easting - 500000.0;
    const y = northingAdj;
    
    const N = a / Math.sqrt(1 - (2 * f) + (f * f));
    
    // Simplified approximation
    const latitude = y / (k0 * N) + this.approxLatCorrection(y, x, N, f, k0);
    const longitude = (x / (k0 * N * Math.cos(latitude * (Math.PI / 180)))) + centralMeridian;
    
    return { x: Math.round(longitude * 1e6) / 1e6, y: Math.round(latitude * 1e6) / 1e6 };
  }

  /**
   * Approximation correction for latitude in UTM inverse
   */
  private approxLatCorrection(y: number, x: number, N: number, f: number, k0: number): number {
    // Simple approximation - for better accuracy use iterative method
    const term1 = (3 * y * x) / (2 * N * N);
    const term2 = (3 * y * y * y) / (2 * N * N * N);
    return (term1 + term2) * (180 / Math.PI);
  }

  /**
   * T6-SP-GIS-TILE-MVT: Generate MVT vector tile for a given tile coordinate.
   * Uses MongoDB $geoIntersects with tile bbox to fetch parcels in the tile extent.
   * Encodes features to Mapbox Vector Tile (MVT) protobuf format using vt-pbf.
   * 
   * @param z - Zoom level
   * @param x - Tile X coordinate
   * @param y - Tile Y coordinate
   * @param tenantId - Tenant identifier
   * @param projectId - Project identifier
   * @returns Buffer with MVT protobuf data
   */
  async getMvtTile(
    z: number,
    x: number,
    y: number,
    tenantId: string,
    projectId: string,
  ): Promise<Buffer> {
    // Calculate tile bbox in WGS84
    const tileBbox = this.tileToBbox(z, x, y);
    
    // Fetch parcels intersecting this tile
    const parcels = await this.model
      .find({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [tileBbox[0], tileBbox[1]],
                  [tileBbox[0], tileBbox[3]],
                  [tileBbox[2], tileBbox[3]],
                  [tileBbox[2], tileBbox[1]],
                  [tileBbox[0], tileBbox[1]],
                ],
              ],
            },
          },
        },
      })
      .select('geometry sqlu inscription status sourceType')
      .lean()
      .exec();

    // Convert parcels to vt-pbf feature format (geojson-vt style)
    // vt-pbf.fromGeojsonVt expects layers created by geojson-vt library
    // Since we don't have geojson-vt, we'll use a simplified approach
    // For now, use vector-tile-js directly through vt-pbf.fromVectorTileJs
    
    // Import dynamically to avoid build-time dependency
    const vectorTile = require('@mapbox/vector-tile');
    const Pbf = require('pbf');
    
    // Create a vector tile object manually
    const tile = new vectorTile.VectorTile(new Pbf());
    const layer = new vectorTile.VectorTileLayer({
      name: MVT_LAYER_NAME,
      version: MVT_LAYER_VERSION,
      extent: MVT_EXTENT,
    });
    
    // Add each parcel as a feature
    parcels.forEach((parcel) => {
      const geom = parcel.geometry;
      const feature = new vectorTile.VectorTileFeature({
        id: parseInt(String(parcel._id).slice(-8), 10) || 1,
        properties: {
          sqlu: parcel.sqlu || '',
          inscription: parcel.inscription || '',
          status: parcel.status || '',
          sourceType: parcel.sourceType || '',
        },
      });
      
      // Project geometry and load into feature
      // Using any for geometry to avoid type complexity with vector-tile
      const bbox = tileBbox;
      
      if (geom.type === 'Polygon') {
        // @ts-ignore - complex geometry type handling
        const projected = this.projectPolygonToTile(geom.coordinates, bbox);
        // @ts-ignore
        feature.loadGeometry(projected);
      } else if (geom.type === 'MultiPolygon') {
        // @ts-ignore
        const projected = this.projectMultiPolygonToTile(geom.coordinates, bbox);
        // For MultiPolygon, use first polygon only for simplicity
        if (projected.length > 0) {
          // @ts-ignore
          feature.loadGeometry(projected[0]);
        }
      } else if (geom.type === 'Point') {
        // @ts-ignore
        const projected = this.projectCoordinateToTile(geom.coordinates, bbox);
        // @ts-ignore
        feature.loadGeometry([[projected]]);
      }
      
      layer.addFeature(feature);
    });
    
    tile.addLayer(layer);
    
    // Convert to buffer using vt-pbf
    return Buffer.from(vtpbf.fromVectorTileJs(tile));
  }

  /**
   * Project a single coordinate from WGS84 to tile-local coordinates
   */
  private projectCoordinateToTile(coord: [number, number], bbox: Bbox): [number, number] {
    const [minX, minY, maxX, maxY] = bbox;
    const scaleX = MVT_EXTENT / (maxX - minX);
    const scaleY = MVT_EXTENT / (maxY - minY);
    
    const px = Math.round((coord[0] - minX) * scaleX);
    const py = Math.round((maxY - coord[1]) * scaleY); // MVT Y is flipped
    
    return [px, py];
  }

  /**
   * Project Polygon geometry to tile-local coordinates
   * Polygon: array of rings (each ring is array of coordinates)
   */
  private projectPolygonToTile(coordinates: [number, number][][], bbox: Bbox): number[][][] {
    const [minX, minY, maxX, maxY] = bbox;
    const scaleX = MVT_EXTENT / (maxX - minX);
    const scaleY = MVT_EXTENT / (maxY - minY);
    
    function project(coord: [number, number]): [number, number] {
      const px = Math.round((coord[0] - minX) * scaleX);
      const py = Math.round((maxY - coord[1]) * scaleY);
      return [px, py];
    }
    
    return coordinates.map((ring: [number, number][]) => ring.map(project));
  }

  /**
   * Project MultiPolygon geometry to tile-local coordinates
   * MultiPolygon: array of polygons, each with array of rings
   */
  private projectMultiPolygonToTile(coordinates: [number, number][][][], bbox: Bbox): number[][][][] {
    const [minX, minY, maxX, maxY] = bbox;
    const scaleX = MVT_EXTENT / (maxX - minX);
    const scaleY = MVT_EXTENT / (maxY - minY);
    
    function project(coord: [number, number]): [number, number] {
      const px = Math.round((coord[0] - minX) * scaleX);
      const py = Math.round((maxY - coord[1]) * scaleY);
      return [px, py];
    }
    
    return coordinates.map((polygon: [number, number][][]) => 
      polygon.map((ring: [number, number][]) => ring.map(project))
    );
  }



  /**
   * Calculate WGS84 bbox for a given tile coordinate.
   * Uses Web Mercator projection (EPSG:3857) standard tiling scheme.
   */
  public tileToBbox(z: number, x: number, y: number): Bbox {
    const n = Math.PI - (2.0 * Math.PI * y) / Math.pow(2, z);
    const minLat = (180.0 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    const maxLat = (180.0 / Math.PI) * Math.atan(0.5 * (Math.exp(n - (2.0 * Math.PI) / Math.pow(2, z))) - Math.exp(-(n - (2.0 * Math.PI) / Math.pow(2, z))));
    
    const minLng = (x / Math.pow(2, z)) * 360.0 - 180.0;
    const maxLng = ((x + 1) / Math.pow(2, z)) * 360.0 - 180.0;

    return [minLng, minLat, maxLng, maxLat];
  }

  /**
   * Calculate tile coordinates from bbox.
   * Useful for determining which tiles a bbox intersects.
   */
  tileCoordinatesFromBbox(bbox: Bbox, z: number): Array<{ z: number; x: number; y: number }> {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    
    const tiles: Array<{ z: number; x: number; y: number }> = [];
    
    // Convert lat/lng to tile coordinates
    const minX = Math.floor(((minLng + 180) / 360) * Math.pow(2, z));
    const maxX = Math.floor(((maxLng + 180) / 360) * Math.pow(2, z));
    
    const minY = Math.floor(
      ((1 - Math.log(Math.tan((minLat * Math.PI) / 180) + 1 / Math.cos((minLat * Math.PI) / 180))) / Math.PI) *
        Math.pow(2, z - 1),
    );
    const maxY = Math.floor(
      ((1 - Math.log(Math.tan((maxLat * Math.PI) / 180) + 1 / Math.cos((maxLat * Math.PI) / 180))) / Math.PI) *
        Math.pow(2, z - 1),
    );

    for (let tx = minX; tx <= maxX; tx++) {
      for (let ty = minY; ty <= maxY; ty++) {
        tiles.push({ z, x: tx, y: ty });
      }
    }

    return tiles;
  }
}
