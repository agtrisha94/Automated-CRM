import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsInt, IsOptional, IsString, Min,
} from 'class-validator';
import { CompanySize, Industry, LeadSource, LeadStatus } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/wasm-compiler-edge.js';

export class CreateLeadDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;

  @ApiPropertyOptional({ enum: CompanySize })
  @IsOptional() @IsEnum(CompanySize) companySize?: CompanySize;

  @ApiPropertyOptional({ enum: Industry })
  @IsOptional() @IsEnum(Industry) industry?: Industry;

  @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.MANUAL })
  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;

  @ApiPropertyOptional({ enum: LeadStatus, default: LeadStatus.NEW })
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) emailOpens?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) websiteVisits?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) formFills?: number;

  @ApiPropertyOptional() @IsOptional() metadata?: JsonValue;
}