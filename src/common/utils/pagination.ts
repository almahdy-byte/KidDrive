export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  modelName: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}

export const getPaginationOptions = (query: any): PaginationOptions => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)) // Max 100 items per page
  };
};

export const calculatePagination = (
  page: number,
  limit: number,
  total: number,
  modelName: string
): PaginationResult => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    totalPages,
    total,
    modelName
  };
};

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationResult
): PaginatedResponse<T> => {
  return {
    data,
    pagination
  };
};

export const getSkipValue = (page: number, limit: number): number => {
  return (page - 1) * limit;
};
