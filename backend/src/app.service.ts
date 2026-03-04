import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';


@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async testDb() {
    const count = await this.prisma.lead.count();
    return { leads: count };
  }

  getHello(): string {
    return 'Hello World!';
  }
}



