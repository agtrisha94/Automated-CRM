/**
 * ============================================================================
 * APP SERVICE
 * ============================================================================
 * 
 * This is the main application service for the NestJS backend.
 * It provides core functionality like health checks and database tests.
 * 
 * WHAT IS A SERVICE?
 * - Services contain business logic
 * - They are "injectable" - NestJS can provide them to controllers/other services
 * - The @Injectable() decorator marks this class as a provider
 * 
 * THIS SERVICE PROVIDES:
 * 1. Health check endpoint (for Docker/Kubernetes monitoring)
 * 2. Database connectivity test
 * 3. Default hello endpoint
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';


@Injectable()
export class AppService {
  /**
   * Constructor with dependency injection.
   * 
   * 'private readonly prisma' does THREE things:
   * 1. Declares a private property called 'prisma'
   * 2. Makes it readonly (can't be reassigned)
   * 3. Automatically assigns the injected PrismaService to it
   * 
   * This is TypeScript shorthand - equivalent to:
   *   private readonly prisma: PrismaService;
   *   constructor(prisma: PrismaService) { this.prisma = prisma; }
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * HEALTH CHECK
   * ------------
   * Used by:
   * - Docker Compose healthcheck (to know if container is ready)
   * - Load balancers (to know if instance can receive traffic)
   * - Monitoring systems (to alert if service is down)
   * 
   * HOW IT WORKS:
   * 1. Tries to run a simple SQL query: SELECT 1
   * 2. If successful → database is connected → status: 'ok'
   * 3. If fails → database is down → status: 'degraded'
   * 
   * @returns Object with status, database connection state, and timestamp
   */
  async getHealth() {
    try {
      // Run a minimal SQL query to test database connectivity
      // `SELECT 1` is a standard way to ping a database
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',              // Service is healthy
        database: 'connected',     // Database connection works
        timestamp: new Date().toISOString(),  // When this check ran
      };
    } catch (error) {
      // Database query failed - service is degraded but running
      return {
        status: 'degraded',        // Service is partially working
        database: 'disconnected',  // Database is unreachable
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * TEST DATABASE CONNECTION
   * ------------------------
   * A simple endpoint to verify database connectivity by counting leads.
   * 
   * USEFUL FOR:
   * - Verifying Prisma is configured correctly
   * - Quick check that the Lead table exists
   * - Debugging database connection issues
   * 
   * @returns Object with the count of leads in the database
   */
  async testDb() {
    // Count all records in the Lead table
    const count = await this.prisma.lead.count();
    return { leads: count };
  }

  /**
   * DEFAULT HELLO ENDPOINT
   * ----------------------
   * Simple endpoint for testing the API is running.
   * This is the default NestJS boilerplate - often used as a sanity check.
   * 
   * @returns "Hello World!" string
   */
  getHello(): string {
    return 'Hello World!';
  }
}



