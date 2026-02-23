import { Injectable } from '@nestjs/common';

type PublishRasterInput = {
  workspace: string;
  store: string;
  layerName: string;
  fileBuffer: Buffer;
};

@Injectable()
export class GeoserverPublisherService {
  private baseUrl() {
    return (process.env.GEOSERVER_URL ?? 'http://geoserver:8080/geoserver').replace(/\/$/, '');
  }

  private authHeader() {
    const user = process.env.GEOSERVER_USER ?? 'admin';
    const password = process.env.GEOSERVER_PASSWORD ?? 'geoserver';
    return `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
  }

  private async geoserverRequest(path: string, options: RequestInit) {
    const response = await fetch(`${this.baseUrl()}${path}`, {
      ...options,
      headers: {
        Authorization: this.authHeader(),
        ...(options.headers ?? {}),
      },
    });
    return response;
  }

  async ensureWorkspace(workspace: string) {
    const exists = await this.geoserverRequest(`/rest/workspaces/${workspace}.json`, {
      method: 'GET',
    });
    if (exists.ok) return;
    const createResponse = await this.geoserverRequest('/rest/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace: { name: workspace },
      }),
    });
    if (!createResponse.ok) {
      throw new Error(`Nao foi possivel criar workspace ${workspace}`);
    }
  }

  async publishGeoTiff(input: PublishRasterInput) {
    await this.ensureWorkspace(input.workspace);

    const upload = await this.geoserverRequest(
      `/rest/workspaces/${input.workspace}/coveragestores/${input.store}/file.geotiff?coverageName=${input.layerName}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/tiff',
        },
        body: input.fileBuffer as unknown as BodyInit,
      },
    );
    if (!upload.ok) {
      const body = await upload.text();
      throw new Error(`Falha ao publicar raster no GeoServer: ${upload.status} ${body}`);
    }

    const configureLayer = await this.geoserverRequest(
      `/rest/workspaces/${input.workspace}/coveragestores/${input.store}/coverages/${input.layerName}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverage: {
            name: input.layerName,
            nativeName: input.layerName,
            srs: 'EPSG:4326',
            enabled: true,
          },
        }),
      },
    );

    if (!configureLayer.ok) {
      const body = await configureLayer.text();
      throw new Error(`Falha ao configurar coverage no GeoServer: ${configureLayer.status} ${body}`);
    }
  }
}

