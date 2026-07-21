import type { ApiSuccessResponse } from './api-response';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  meta: PaginationMeta;
}
