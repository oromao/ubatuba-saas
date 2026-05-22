import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ParcelDocument } from '../../src/modules/ctm/parcels/parcel.schema';

describe('CTM Vistorias/Inspections Integration (T2-INSPECT-E2E backend)', () => {
  let app: INestApplication;
  let tenantId: string;
  let accessToken: string;
  let parcelId: string;
  let vistoriaId: string;

  beforeAll(async () => {
    tenantId = new Types.ObjectId().toHexString();
    accessToken = 'test-token-placeholder';

    const jwtServiceMock = {
      verify: () => {
        return { sub: new Types.ObjectId().toHexString(), role: 'ADMIN', tenantId };
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Criar uma parcela real vinculada ao tenantId dinâmico para os testes de vistorias
    const parcelModel = moduleFixture.get<Model<ParcelDocument>>(getModelToken('Parcel'));
    const testParcel = await parcelModel.create({
      tenantId: new Types.ObjectId(tenantId),
      projectId: new Types.ObjectId(),
      sqlu: 'SQLU-VISTORIA-TEST',
      mainAddress: 'Rua Test Vistoria 123',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
      },
      status: 'ATIVO'
    });
    parcelId = testParcel._id.toString();
  });

  afterAll(async () => {
    if (app) {
      // Limpar os dados criados no teste
      const parcelModel = app.get<Model<ParcelDocument>>(getModelToken('Parcel'));
      await parcelModel.deleteMany({ tenantId: new Types.ObjectId(tenantId) });

      const vistoriaModel = app.get(getModelToken('Vistoria'));
      await vistoriaModel.deleteMany({ tenantId });

      await app.close();
    }
  });

  describe('Vistoria CRUD Flow (T2 requirement)', () => {
    beforeAll(async () => {
      // Get a parcel to link vistoria to
      const parcelsResponse = await request(app.getHttpServer())
        .get('/ctm/parcels')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      if (parcelsResponse.body.length > 0) {
        parcelId = parcelsResponse.body[0]._id;
      }
    });

    it('01 - Create new vistoria', async () => {
      if (!parcelId) return;

      const vistoriaData = {
        tipo: 'INICIAL',
        parcelId,
        data: new Date().toISOString(),
        observacoes: 'Vistoria de teste de integracao',
      };

      const response = await request(app.getHttpServer())
        .post('/ctm/vistorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(vistoriaData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('parcelId');
      expect(response.body.parcelId).toBe(parcelId);
      vistoriaId = response.body._id;
    });

    it('02 - List vistorias for parcel', async () => {
      if (!parcelId) return;

      const response = await request(app.getHttpServer())
        .get('/ctm/vistorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ parcelId })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Should contain the vistoria we just created
      if (vistoriaId) {
        const found = response.body.find((v: any) => v._id === vistoriaId);
        expect(found).toBeDefined();
      }
    });

    it('03 - Get vistoria detail', async () => {
      if (!vistoriaId) return;

      const response = await request(app.getHttpServer())
        .get(`/ctm/vistorias/${vistoriaId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(vistoriaId);
      expect(response.body).toHaveProperty('status');
    });

    it('04 - Transition vistoria status', async () => {
      if (!vistoriaId) return;

      const statusTransition = {
        status: 'ENVIADA',
        observacao: 'Movendo para enviada',
      };

      const response = await request(app.getHttpServer())
        .post(`/ctm/vistorias/${vistoriaId}/transicao`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(statusTransition)
        .expect(201);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ENVIADA');
    });

    it('05 - Verify status persisted (reload)', async () => {
      if (!vistoriaId) return;

      const response = await request(app.getHttpServer())
        .get(`/ctm/vistorias/${vistoriaId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('ENVIADA');
    });

    it('06 - Verify vistoria history (in document)', async () => {
      if (!vistoriaId) return;

      const response = await request(app.getHttpServer())
        .get(`/ctm/vistorias/${vistoriaId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('historico');
      expect(response.body.historico).toBeInstanceOf(Array);
      // Deve ter o histórico de criação e transição (pelo menos 2 itens)
      expect(response.body.historico.length).toBeGreaterThanOrEqual(2);
      expect(response.body.historico[1].status).toBe('ENVIADA');
    });
  });

  describe('Vistoria filtering and search', () => {
    it('Should list vistorias with status filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/vistorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ status: 'PENDENTE' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('Should list vistorias with type filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/vistorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ tipo: 'LEVANTAMENTO' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('Should search vistorias by text', async () => {
      const response = await request(app.getHttpServer())
        .get('/ctm/vistorias')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ q: 'test' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });
});
