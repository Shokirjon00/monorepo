import { InjectionToken } from '@angular/core';
import { ICaption, IFilterParams } from '@eskhata/util';

export type FilterParamsParser = (
  filters: { [key: string]: any },
  param: IFilterParams,
  captions?: ICaption[],
  excludeKeys?: string[]
) => IFilterParams;

export const FILTER_PARAMS_PARSER = new InjectionToken<FilterParamsParser>('FILTER_PARAMS_PARSER');
