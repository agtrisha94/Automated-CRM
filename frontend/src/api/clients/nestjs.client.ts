/**
 * NestJS API Client
 * Handles all requests to backend NestJS server (port 3000)
 * Includes request/response interceptors for consistent error handling
 */
import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { config } from '../config'

export interface ApiError {
  statusCode: number
  message: string | string[]
  timestamp: string
  path: string
}

// Create axios instance
const nestjsClient: AxiosInstance = axios.create({
  baseURL: config.NESTJS_BASE_URL,
  timeout: config.NESTJS_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
nestjsClient.interceptors.request.use(
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
    console.error('[NestJS Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor
nestjsClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status || 0
    const data = error.response?.data

    // Normalize error response
    const normalizedError = {
      statusCode: data?.statusCode || status,
      message: data?.message || error.message,
      timestamp: data?.timestamp || new Date().toISOString(),
      path: data?.path || '',
      originalError: error,
    }

    // Log errors (useful for debugging)
    if (status >= 500) {
      console.error('[NestJS Server Error]', normalizedError)
    } else if (status >= 400) {
      console.warn('[NestJS Client Error]', normalizedError)
    }

    // Return normalized error for thunks to handle
    return Promise.reject(normalizedError)
  }
)

export default nestjsClient
