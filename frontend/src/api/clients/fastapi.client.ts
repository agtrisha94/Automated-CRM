/**
 * FastAPI Client
 * Handles all requests to FastAPI server (port 8000)
 * Used for ML scoring and research endpoints
 * Longer timeout due to batch processing operations
 */
import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { config } from '../config'

export interface FastApiError {
  detail?: string
  message?: string
  status_code?: number
  [key: string]: any
}

// Create axios instance
const fastapiClient: AxiosInstance = axios.create({
  baseURL: config.FASTAPI_BASE_URL,
  timeout: config.FASTAPI_TIMEOUT, // Longer timeout for ML operations
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
fastapiClient.interceptors.request.use(
  (requestConfig) => {
    // Add Content-Type header
    if (!requestConfig.headers['Content-Type']) {
      requestConfig.headers['Content-Type'] = 'application/json'
    }

    // TODO: Slot for future auth header
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   requestConfig.headers.Authorization = `Bearer ${token}`
    // }

    return requestConfig
  },
  (error) => {
    console.error('[FastAPI Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor
fastapiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<FastApiError>) => {
    const status = error.response?.status || 0
    const data = error.response?.data

    // Normalize error response (FastAPI uses different format than NestJS)
    const normalizedError = {
      statusCode: data?.status_code || status,
      message: data?.detail || data?.message || error.message,
      originalError: error,
    }

    // Log errors
    if (status >= 500) {
      console.error('[FastAPI Server Error]', normalizedError)
    } else if (status >= 400) {
      console.warn('[FastAPI Client Error]', normalizedError)
    }

    // Return normalized error for thunks to handle
    return Promise.reject(normalizedError)
  }
)

export default fastapiClient
