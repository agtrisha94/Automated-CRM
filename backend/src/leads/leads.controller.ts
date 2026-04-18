import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: LeadStatus,
  ) {
    return this.leadsService.findAll(+page, +limit, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Get(':id/interactions')
  getInteractions(@Param('id') id: string) {
    return this.leadsService.getInteractions(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}