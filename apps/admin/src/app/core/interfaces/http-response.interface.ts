export interface IHttpResponse<T> {
  status?: boolean;
  data: T;
  meta: IHttpResponseMeta;
  errorCode?: number;
  message?: string;
  errors?: any;
  code: number;
  success?: boolean;
}

export interface IHttpResponseMeta {
  pagination?: Pagination;
  temporaryToken?: string;
  accessToken?: string;
  refreshToken?: string;
  route?: number;
  fileStorageUrl?: string;
  fileStorageToken?: string;
}

export interface Pagination {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
