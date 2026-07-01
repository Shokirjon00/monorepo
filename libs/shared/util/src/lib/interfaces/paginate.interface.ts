export interface IPaginate {
  pageSize?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  totalItems: number;
  totalPages: number
}
