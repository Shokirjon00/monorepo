import {ICaption, IParam} from '@eskhata/util';

export interface IHttpResponse<T> {
  status?: boolean;
  data: T;
  meta: IHttpResponseMeta;
  errorCode?: number;
  message?: string;
  errors?: any;
  code: number;
  caption?: ICaption[];
  device?: any;
}

export interface IHttpResponseMeta {
  pagination?: Pagination;
  temporaryToken?: string;
  accessToken?: string;
  refreshTokenDuration?: string;
  refreshToken?: string;
  route?: number;
  companyLogoUrl?: string;
  currencyContractDocumentFileUrl?: string;
  fileStorageUrl?: string;
  fileStorageToken?: string;
  file: IParam;
}

export interface Pagination {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
