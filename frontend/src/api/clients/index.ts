/**
 * API Clients Barrel Export
 * Re-exports both NestJS and FastAPI clients for use in API services
 */
export { default as nestjsClient, type ApiError } from './nestjs.client'
export { default as fastapiClient, type FastApiError } from './fastapi.client'
