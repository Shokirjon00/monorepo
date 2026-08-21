import { IParam } from '../interfaces/param.interface';
import { IFilterParams } from '../interfaces/filter-params.interface';

export function setDefaultFilterValue(queryParam: IParam, module: string): IFilterParams {
  const params: IFilterParams = { ...queryParam };
  params.page = queryParam['page'] || 1;
  params.pageSize = queryParam['pageSize'] || 15;
  if (params['module'] && module !== params['module']) {
    params.page = 1;
  } else {
    params.module = module;
  }
  return params;
}
