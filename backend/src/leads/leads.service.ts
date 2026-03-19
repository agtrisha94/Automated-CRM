import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from '@prisma/client';
import { Prisma } from '@prisma/client'; 

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
  return this.prisma.lead.create({
    data: dto as Prisma.LeadCreateInput,
  });
}

  findAll(page = 1, limit = 20, status?: LeadStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    return Promise.all([
      this.prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
  await this.findOne(id);
  return this.prisma.lead.update({
    where: { id },
    data: dto as Prisma.LeadUpdateInput,  // add this cast
  });
}

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.update({
      where: { id },
      data: { status: LeadStatus.LOST },
    });
  }
}