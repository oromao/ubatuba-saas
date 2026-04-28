import { Controller, Get, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GisService } from './gis.service';
import { Coordinate, CoordinateTransformResult } from './gis.service';

@ApiTags('GIS')
@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  // ==========================================================================
  // T8-GIS-CRS: CRS Transform UTM<->WGS84
  // ==========================================================================

  @Get('convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convert coordinates between CRS systems',
    description: 'Converts coordinates between supported CRS systems. Currently supports: WGS84 (EPSG:4326) <-> UTM 23S (EPSG:31983). For UTM to WGS84: provide easting as x, northing as y. For WGS84 to UTM: provide longitude as x, latitude as y.',
  })
  @ApiQuery({ name: 'from', required: true, description: 'Source EPSG code (e.g., 4326 for WGS84, 31983 for UTM 23S)' })
  @ApiQuery({ name: 'to', required: true, description: 'Target EPSG code (e.g., 4326 for WGS84, 31983 for UTM 23S)' })
  @ApiQuery({ name: 'x', required: true, description: 'X coordinate (longitude for WGS84, easting for UTM)' })
  @ApiQuery({ name: 'y', required: true, description: 'Y coordinate (latitude for WGS84, northing for UTM)' })
  @ApiResponse({
    status: 200,
    description: 'Coordinate transformation result',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or unsupported CRS conversion',
  })
  convertCoordinate(
    @Query('from') fromEPSG: number,
    @Query('to') toEPSG: number,
    @Query('x') x: number,
    @Query('y') y: number,
  ): CoordinateTransformResult {
    return this.gisService.transformCoordinate(
      { x, y },
      fromEPSG,
      toEPSG,
    );
  }

  @Post('convert/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch convert coordinates between CRS systems',
    description: 'Converts multiple coordinates between supported CRS systems.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of coordinate transformation results',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or unsupported CRS conversion',
  })
  batchConvertCoordinates(
    @Body() body: {
      from: number;
      to: number;
      coordinates: Coordinate[];
    },
  ): CoordinateTransformResult[] {
    const { from, to, coordinates } = body;
    return this.gisService.transformCoordinates(coordinates, from, to).map((output, index) => ({
      fromEPSG: from,
      toEPSG: to,
      input: coordinates[index],
      output,
    }));
  }

  // ==========================================================================
  // T8-GIS-BBOX: Bbox Viewport Query
  // ==========================================================================

  @Get('bbox')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query parcels within a viewport bbox',
    description: 'Returns parcels that intersect with the given bounding box. Uses MongoDB $geoIntersects with 2dsphere index. Default limit: 1000 features for performance.',
  })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'projectId', required: true, description: 'Project ID' })
  @ApiQuery({ name: 'minLng', required: true, description: 'Minimum longitude' })
  @ApiQuery({ name: 'minLat', required: true, description: 'Minimum latitude' })
  @ApiQuery({ name: 'maxLng', required: true, description: 'Maximum longitude' })
  @ApiQuery({ name: 'maxLat', required: true, description: 'Maximum latitude' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results (default: 1000, max: 1000)' })
  @ApiResponse({
    status: 200,
    description: 'GeoJSON FeatureCollection with parcels in the bbox',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid bbox coordinates',
  })
  async queryBbox(
    @Query('tenantId') tenantId: string,
    @Query('projectId') projectId: string,
    @Query('minLng') minLng: number,
    @Query('minLat') minLat: number,
    @Query('maxLng') maxLng: number,
    @Query('maxLat') maxLat: number,
    @Query('limit') limit?: number,
  ) {
    const bbox = [minLng, minLat, maxLng, maxLat] as [number, number, number, number];
    return this.gisService.queryBboxViewport({
      tenantId,
      projectId,
      bbox,
      limit,
    });
  }

  // ==========================================================================
  // T8-GIS-BBOX: Legacy endpoint name for backward compatibility
  // ==========================================================================

  @Get('viewport')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query parcels within a viewport (alias for bbox)',
    description: 'Same as /gis/bbox but with different parameter names for compatibility.',
  })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'projectId', required: true, description: 'Project ID' })
  @ApiQuery({ name: 'bbox', required: true, description: 'Bounding box as comma-separated values: minLng,minLat,maxLng,maxLat' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results' })
  async queryViewport(
    @Query('tenantId') tenantId: string,
    @Query('projectId') projectId: string,
    @Query('bbox') bbox: string,
    @Query('limit') limit?: number,
  ) {
    const coords = bbox.split(',').map(parseFloat) as [number, number, number, number];
    if (coords.length !== 4) {
      throw new Error('Invalid bbox format. Expected: minLng,minLat,maxLng,maxLat');
    }
    return this.gisService.queryBboxViewport({
      tenantId,
      projectId,
      bbox: coords,
      limit,
    });
  }
}
