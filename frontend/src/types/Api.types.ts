export const RequestStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export interface ApiError {
  message: string;
  statusCode: number | null;
  endpoint: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}