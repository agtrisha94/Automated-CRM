/**
 * API Configuration
 * Environment-based settings for backend clients
 */

export const config = {
  // Mock data flag for offline development
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',

  // Base URLs
  NESTJS_BASE_URL: import.meta.env.VITE_NESTJS_URL || 'http://localhost:3000/api',
  FASTAPI_BASE_URL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000',

  // Timeouts (ms)
  NESTJS_TIMEOUT: 10000, // Standard REST endpoints
  FASTAPI_TIMEOUT: 30000, // ML scoring + research endpoints (longer for batch operations)

  // Retry config
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms between retries

  // Version
  API_VERSION: '1.0',
}
