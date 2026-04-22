import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request = require('supertest');
import { NotificationsLettersController } from '../src/modules/notifications-letters/notifications-letters.controller';
import { NotificationsLettersService } from '../src/modules/notifications-letters/notifications-letters.service';
import { NotificationsLettersRepository } from '../src/modules/notifications-letters/notifications-letters.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';

describe('NotificationsLetters unread-count', () => {
  let app: INestApplication;

  const serviceMock = {
    getUnreadCount: jest.fn().mockResolvedValue({ count: 3 }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsLettersController],
      providers: [
        { provide: NotificationsLettersService, useValue: serviceMock },
        {
          provide: NotificationsLettersRepository,
          useValue: {},
        },
        {
          provide: ProjectsService,
          useValue: {},
        },
        {
          provide: ParcelsRepository,
          useValue: {},
        },
        {
          provide: ObjectStorageService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as { tenantId?: string }).tenantId = 'tenant-1';
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a real count instead of 404', async () => {
    await request(app.getHttpServer())
      .get('/notifications-letters/unread-count')
      .expect(200)
      .expect((res) => {
        expect(res.body.count).toBe(3);
      });
  });
});
