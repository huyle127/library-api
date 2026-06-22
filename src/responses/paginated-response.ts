export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string,
): PaginatedResponse<T> => ({ status: 'success', message, data, total, page, limit });
