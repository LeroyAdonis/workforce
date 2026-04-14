/**
 * Pagination utilities for API routes
 * @phase Phase 4 - Core API Development
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Calculate pagination offset
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages
 */
export function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = getTotalPages(total, limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
