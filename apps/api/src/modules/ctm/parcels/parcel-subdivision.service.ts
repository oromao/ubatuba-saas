import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parcel, ParcelDocument } from './parcel.schema';
import { ParcelSubdivision, ParcelSubdivisionDocument } from './parcel-subdivision.schema';
import { ParcelSubdivisionRepository } from './parcel-subdivision.repository';
import { ParcelsRepository } from './parcels.repository';
import { GeometryService } from '../geometry.service';
import { asObjectId } from '../../../common/utils/object-id';
import { CreateSubdivisionDto } from './dto/create-subdivision.dto';
import { UpdateSubdivisionDto } from './dto/update-subdivision.dto';

@Injectable()
export class ParcelSubdivisionService {
  constructor(
    @InjectModel(Parcel.name) private readonly parcelModel: Model<ParcelDocument>,
    private readonly repository: ParcelSubdivisionRepository,
    private readonly parcelsRepository: ParcelsRepository,
    private readonly geometryService: GeometryService,
  ) {}

  async createRequest(
    tenantId: string,
    projectId: string,
    userId: string,
    dto: CreateSubdivisionDto,
  ): Promise<ParcelSubdivisionDocument> {
    const parent = await this.parcelsRepository.findById(tenantId, projectId, dto.parentParcelId);
    if (!parent) {
      throw new NotFoundException('Parcela origem nao encontrada');
    }

    if (parent.statusCadastral !== 'ATIVO' && parent.statusCadastral !== 'CONFLITO') {
      throw new BadRequestException('Parcela origem deve estar ATIVO ou CONFLITO');
    }

    if (dto.childDefinitions.length < 2) {
      throw new BadRequestException('Desmembramento requer pelo menos 2 parcelas filhas');
    }

    // Validate child geometries
    for (const child of dto.childDefinitions) {
      if (!this.geometryService.isValidGeometry(child.geometry)) {
        throw new BadRequestException(`Geometria invalida para parcela ${child.sqlu}`);
      }
    }

    // Check children do not overlap
    this.geometryService.validateNoOverlap(dto.childDefinitions.map((c) => c.geometry));

    // Calculate child areas
    const childrenWithArea = dto.childDefinitions.map((child) => ({
      ...child,
      area: this.geometryService.calculateArea(child.geometry),
      areaPercent: 0,
    }));

    const totalChildArea = childrenWithArea.reduce((sum, c) => sum + c.area, 0);
    childrenWithArea.forEach((c) => {
      c.areaPercent = Math.round((c.area / totalChildArea) * 10000) / 100;
    });

    return this.repository.create({
      tenantId: asObjectId(tenantId) as any,
      projectId: asObjectId(projectId) as any,
      parentParcelId: asObjectId(dto.parentParcelId) as any,
      tipo: dto.tipo || 'DESMEMBRAMENTO',
      status: 'RASCUNHO',
      numeroProcesso: dto.numeroProcesso,
      motivo: dto.motivo,
      observacoes: dto.observacoes,
      requerente: dto.requerente,
      childDefinitions: childrenWithArea,
      createdBy: asObjectId(userId) as any,
    } as any);
  }

  async listRequests(
    tenantId: string,
    projectId: string,
    filters?: { status?: string; tipo?: string; parentParcelId?: string },
  ): Promise<ParcelSubdivisionDocument[]> {
    return this.repository.list(tenantId, projectId, filters as any);
  }

  async getRequest(tenantId: string, id: string): Promise<ParcelSubdivisionDocument | null> {
    return this.repository.findById(tenantId, id);
  }

  async updateRequest(
    tenantId: string,
    id: string,
    dto: UpdateSubdivisionDto,
  ): Promise<ParcelSubdivisionDocument | null> {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    if (request.status === 'APROVADO' || request.status === 'REJEITADO' || request.status === 'CANCELADO') {
      throw new BadRequestException('Solicitacao ja finalizada');
    }

    const update: Partial<ParcelSubdivision> = {};
    if (dto.motivo !== undefined) update.motivo = dto.motivo;
    if (dto.observacoes !== undefined) update.observacoes = dto.observacoes;
    if (dto.requerente !== undefined) update.requerente = dto.requerente;

    if (dto.status) {
      const validTransitions: Record<string, string[]> = {
        RASCUNHO: ['PROTOCOLADO', 'CANCELADO'],
        PROTOCOLADO: ['EM_ANALISE', 'CANCELADO'],
        EM_ANALISE: ['APROVADO', 'REJEITADO', 'CANCELADO'],
      };
      const allowed = validTransitions[request.status] || [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(`Transicao invalida: ${request.status} -> ${dto.status}`);
      }
      update.status = dto.status as any;
    }

    return (await this.repository.update(id, tenantId, update))!;
  }

  async approve(
    tenantId: string,
    projectId: string,
    requestId: string,
    userId: string,
  ): Promise<ParcelSubdivisionDocument> {
    const request = await this.repository.findById(tenantId, requestId);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');

    const allowedStatuses = ['PROTOCOLADO', 'EM_ANALISE'];
    if (!allowedStatuses.includes(request.status)) {
      throw new BadRequestException(`Solicitacao em status ${request.status} nao pode ser aprovada`);
    }

    const parent = await this.parcelsRepository.findById(tenantId, projectId, String(request.parentParcelId));
    if (!parent) throw new NotFoundException('Parcela origem nao encontrada');

    // Create child parcels
    const childIds: Types.ObjectId[] = [];
    for (const childDef of request.childDefinitions) {
      const child = await this.parcelModel.create({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        sqlu: childDef.sqlu,
        geometry: childDef.geometry,
        areaTerreno: childDef.area,
        area: childDef.area,
        mainAddress: childDef.mainAddress || parent.mainAddress,
        inscricaoImobiliaria: childDef.inscricaoImobiliaria,
        setor: parent.setor,
        quadra: parent.quadra,
        zoneamento: parent.zoneamento,
        sourceType: 'MANUAL',
        statusCadastral: 'ATIVO',
        workflowStatus: 'PENDENTE',
        originType: 'SUBDIVIDED',
        parentParcelId: asObjectId(request.parentParcelId),
        subdivisionRequestId: asObjectId(requestId),
        subdivisionDate: new Date(),
        createdBy: asObjectId(userId),
        logradouroId: parent.logradouroId,
        zoneId: parent.zoneId,
      });
      childIds.push(child._id as Types.ObjectId);
    }

    // Archive parent
    await this.parcelModel.updateOne(
      { _id: request.parentParcelId },
      {
        $set: {
          statusCadastral: 'INATIVO',
          originType: 'ORIGINAL',
          observacoes: `Desmembrado em ${childIds.length} lotes (solicitacao ${requestId})`,
          updatedBy: asObjectId(userId),
        },
      },
    );

    // Create centroid and bbox for each child
    for (const childId of childIds) {
      const childParcel = await this.parcelModel.findById(childId);
      if (childParcel?.geometry) {
        const centroid = this.geometryService.calculateCentroid(childParcel.geometry);
        const bbox = this.geometryService.calculateBbox(childParcel.geometry);
        await this.parcelModel.updateOne(
          { _id: childId },
          { $set: { centroid, bbox } },
        );
      }
    }

    return (await this.repository.update(requestId, tenantId, {
      status: 'APROVADO',
      childParcelIds: childIds,
      aprovadoPor: asObjectId(userId),
      aprovadoEm: new Date(),
    } as any))!;
  }

  async reject(
    tenantId: string,
    requestId: string,
    userId: string,
    motivoRejeicao: string,
  ): Promise<ParcelSubdivisionDocument | null> {
    const request = await this.repository.findById(tenantId, requestId);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');

    const allowedStatuses = ['PROTOCOLADO', 'EM_ANALISE'];
    if (!allowedStatuses.includes(request.status)) {
      throw new BadRequestException(`Solicitacao em status ${request.status} nao pode ser rejeitada`);
    }

    return (await this.repository.update(requestId, tenantId, {
      status: 'REJEITADO',
      motivoRejeicao,
      rejeitadoPor: asObjectId(userId),
      rejeitadoEm: new Date(),
    } as any))!;
  }

  async cancel(
    tenantId: string,
    requestId: string,
  ): Promise<ParcelSubdivisionDocument | null> {
    const request = await this.repository.findById(tenantId, requestId);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');

    const cancellable = ['RASCUNHO', 'PROTOCOLADO', 'EM_ANALISE'];
    if (!cancellable.includes(request.status)) {
      throw new BadRequestException(`Solicitacao em status ${request.status} nao pode ser cancelada`);
    }

    return (await this.repository.update(requestId, tenantId, { status: 'CANCELADO' } as any))!;
  }

  async getChildren(tenantId: string, parentParcelId: string): Promise<any[]> {
    return this.parcelModel
      .find({ tenantId, parentParcelId: asObjectId(parentParcelId) } as any)
      .lean()
      .exec();
  }

  async getParentChain(tenantId: string, parcelId: string): Promise<any[]> {
    const chain: any[] = [];
    let current = await this.parcelModel.findById(parcelId).lean().exec();
    const visited = new Set<string>();

    while (current && current.parentParcelId && !visited.has(String(current._id))) {
      visited.add(String(current._id));
      const parent = await this.parcelModel
        .findById(current.parentParcelId)
        .lean()
        .exec();
      if (parent) {
        chain.push(parent);
        current = parent;
      } else {
        break;
      }
    }

    return chain;
  }
}
