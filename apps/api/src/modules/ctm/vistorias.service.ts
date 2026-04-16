import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vistoria, VistoriaDocument } from './vistoria.schema';
import { CreateVistoriaDto } from './dto/create-vistoria.dto';
import { UpdateVistoriaDto } from './dto/update-vistoria.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  RASCUNHO: ['ENVIADA', 'CANCELADA'],
  ENVIADA: ['EM_ANALISE', 'CANCELADA'],
  EM_ANALISE: ['APROVADA', 'REJEITADA', 'CANCELADA'],
  APROVADA: ['CANCELADA'],
  REJEITADA: [],
  CANCELADA: [],
};

@Injectable()
export class VistoriasService {
  constructor(
    @InjectModel(Vistoria.name) private model: Model<VistoriaDocument>,
  ) {}

  async create(dto: CreateVistoriaDto, userId: string, tenantId: string) {
    if (!dto.parcelId) throw new BadRequestException('parcelId obrigatório');
    if (!dto.tipo) throw new BadRequestException('tipo obrigatório');
    if (!dto.data) throw new BadRequestException('data obrigatória');

    const vistoria = await this.model.create({
      ...dto,
      data: new Date(dto.data),
      status: 'RASCUNHO',
      fotos: dto.fotos || [],
      historico: [{ status: 'RASCUNHO', observacao: 'Criada', userId, timestamp: new Date() }],
      operadorId: userId,
      tenantId,
    });
    return vistoria;
  }

  async findAll(tenantId: string, parcelId?: string) {
    const filter: Record<string, string> = { tenantId };
    if (parcelId) filter.parcelId = parcelId;
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, tenantId: string) {
    const v = await this.model.findOne({ _id: id, tenantId }).exec();
    if (!v) throw new NotFoundException('Vistoria não encontrada');
    return v;
  }

  async update(id: string, dto: UpdateVistoriaDto, tenantId: string) {
    const v = await this.findById(id, tenantId);
    Object.assign(v, dto);
    return v.save();
  }

  async transicao(id: string, newStatus: string, observacao: string, userId: string, tenantId: string) {
    const v = await this.findById(id, tenantId);
    const allowed = VALID_TRANSITIONS[v.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Transição inválida: ${v.status} → ${newStatus}`);
    }
    v.status = newStatus;
    v.historico = [...(v.historico || []), { status: newStatus, observacao, userId, timestamp: new Date() }];
    return v.save();
  }

  async addFotos(id: string, urls: string[], tenantId: string) {
    const v = await this.findById(id, tenantId);
    v.fotos = [...(v.fotos || []), ...urls];
    return v.save();
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.model.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
