import { Controller, Get, Post, Body, Query, Req, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { GisService, Bbox, Coordinate, CoordinateTransformResult } from './gis.service';

@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  /**
   * T6-SP-GIS-BBOX-VIEWPORT: Endpoint to query parcels within viewport bbox.
   * Returns max 1000 features to prevent browser crash with large datasets.
   * Uses $geoIntersects with 2dsphere index for performance.
   * 
   * @param bbox - Comma-separated: minLng,minLat,maxLng,maxLat
   * @param limit - Max results (capped at 1000)
   */
  @Get('bbox')
  async bboxQuery(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string,
    @Query('bbox') bboxRaw: string,
    @Query('limit') limitRaw?: string,
  ) {
    // Parse bbox
    if (!bboxRaw) {
      return {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
        error: 'bbox parameter required. Format: minLng,minLat,maxLng,maxLat',
      };
    }

    const bboxCoords = bboxRaw.split(',').map(Number);
    
    if (bboxCoords.length !== 4 || bboxCoords.some(isNaN)) {
      return {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
        error: 'Invalid bbox format. Expected: minLng,minLat,maxLng,maxLat',
      };
    }

    const bbox: Bbox = bboxCoords as Bbox;
    
    // Validate bbox coordinates
    if (bbox[0] < -180 || bbox[0] > 180 || bbox[2] < -180 || bbox[2] > 180) {
      return {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
        error: 'Invalid longitude values. Must be between -180 and 180',
      };
    }
    if (bbox[1] < -90 || bbox[1] > 90 || bbox[3] < -90 || bbox[3] > 90) {
      return {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
        error: 'Invalid latitude values. Must be between -90 and 90',
      };
    }

    const limit = limitRaw ? parseInt(limitRaw, 10) : 1000;

    return this.gisService.queryBboxViewport({
      tenantId: req.tenantId,
      projectId,
      bbox,
      limit: Math.min(limit, 1000), // Enforce max 1000
    });
  }

  /**
   * T7-SP-CRS-TRANSFORM: Convert coordinates between CRS systems.
   * GET /api/gis/convert?from=4326&to=31983&x=-46.6333&y=-23.5505
   * Supports: WGS84(4326) <-> UTM 23S(31983) for São Paulo
   */
  @Get('convert')
  async convertCoordinate(
    @Query('from') fromRaw: string,
    @Query('to') toRaw: string,
    @Query('x') xRaw: string,
    @Query('y') yRaw: string,
  ): Promise<CoordinateTransformResult | { error: string }> {
    const fromEPSG = parseInt(fromRaw, 10);
    const toEPSG = parseInt(toRaw, 10);
    const x = parseFloat(xRaw);
    const y = parseFloat(yRaw);

    if (isNaN(fromEPSG) || isNaN(toEPSG)) {
      return { error: 'Invalid EPSG codes. from and to parameters must be numbers' };
    }

    if (isNaN(x) || isNaN(y)) {
      return { error: 'Invalid coordinates. x and y parameters must be numbers' };
    }

    try {
      return this.gisService.transformCoordinate(
        { x, y },
        fromEPSG,
        toEPSG,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { error: message };
    }
  }

  /**
   * T7-SP-CRS-TRANSFORM: Batch convert multiple coordinates.
   * POST /api/gis/convert
   * Body: { from: 4326, to: 31983, coordinates: [{x: -46.6333, y: -23.5505}, ...] }
   */
  @Post('convert')
  async batchConvertCoordinate(
    @Body() body: {
      from: number;
      to: number;
      coordinates: Coordinate[];
    },
  ): Promise<{ results: CoordinateTransformResult[] } | { error: string }> {
    const { from, to, coordinates } = body;

    if (!Array.isArray(coordinates)) {
      return { error: 'coordinates must be an array' };
    }

    if (coordinates.length === 0) {
      return { results: [] };
    }

    try {
      const results = coordinates.map((coord) =>
        this.gisService.transformCoordinate(coord, from, to),
      );
      return { results };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { error: message };
    }
  }

  /**
   * T6-SP-GIS-TILE-MVT: Serve MVT vector tiles.
   * GET /gis/tiles/:z/:x/:y.pbf
   * Returns Mapbox Vector Tile (MVT) protobuf format.
   */
  @Get('tiles/:z/:x/:y.pbf')
  async getMvtTile(
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const zNum = parseInt(z, 10);
      const xNum = parseInt(x, 10);
      const yNum = parseInt(y, 10);

      if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
        res.status(400).json({ error: 'Invalid tile coordinates' });
        return;
      }

      if (!projectId) {
        res.status(400).json({ error: 'projectId is required' });
        return;
      }

      const buffer = await this.gisService.getMvtTile(zNum, xNum, yNum, req.tenantId, projectId);
      
      res.set({
        'Content-Type': 'application/x-protobuf',
        'Content-Encoding': 'identity',
      });
      res.send(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * T6-SP-GIS-TILE-MVT: Get MVT tile metadata.
   * GET /gis/tiles/metadata?z=12&x=2000&y=3000
   */
  @Get('tiles/metadata')
  async getTileMetadata(
    @Query('z') zRaw: string,
    @Query('x') xRaw: string,
    @Query('y') yRaw: string,
  ) {
    const z = parseInt(zRaw, 10);
    const x = parseInt(xRaw, 10);
    const y = parseInt(yRaw, 10);

    if (isNaN(z) || isNaN(x) || isNaN(y)) {
      return { error: 'Invalid tile coordinates' };
    }

    const bbox = this.gisService.tileToBbox(z, x, y);
    return {
      z,
      x,
      y,
      bbox,
      bounds: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
    };
  }
}
