/**
 * Standardized API response utilities
 * @phase Phase 4 - Core API Development
 */

import { NextResponse } from "next/server";
import type { PaginationMeta } from "./pagination";

/**
 * Success response type
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Error response type
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
  status: number = 200,
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(response, { status });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, undefined, 201);
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: unknown,
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    ...(details ? { details } : {}),
  };
  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const errors = {
  badRequest: (message: string = "Bad request", details?: unknown) =>
    errorResponse(message, 400, details),

  unauthorized: (message: string = "Unauthorized") =>
    errorResponse(message, 401),

  forbidden: (message: string = "Forbidden") => errorResponse(message, 403),

  notFound: (message: string = "Not found") => errorResponse(message, 404),

  internal: (message: string = "Internal server error") =>
    errorResponse(message, 500),

  validationError: (details: unknown) =>
    errorResponse("Validation error", 400, details),
};
