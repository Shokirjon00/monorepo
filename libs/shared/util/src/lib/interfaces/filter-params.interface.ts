export interface IFilterParams {
  filters?: string;
  filter?: string;
  sorts?: string | any;
  orderBy?: string | any;
  page?: number;
  pageSize?: number;
  module?: string;
  addDeactives?: boolean;
  selectedList?: string | string[];
}
