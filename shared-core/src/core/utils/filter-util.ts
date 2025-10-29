import { MatchMode } from '../enums/match-mode.enum';
import { ICaption } from '../interfaces/table.interface';
import { isGuid, isListOfGuids } from './is-guid';
import { SieveOperators } from '../enums/sieve.enum';
import { IFilterParams } from '../interfaces/filter-params.interface';

export function parseFilterParams(filters: { [key: string]: any }, param: IFilterParams, captions: ICaption[] = []): IFilterParams {
  const params: Set<string> = new Set();
  const captionField: any = {};
  // @ts-ignore
  (captions || []).forEach(item => captionField[item.field] = item);
  for (const filtersKey in filters) {
    if (!['page', 'pageSize', 'module', 'sorts'].includes(filtersKey)) {
      const item = filters[filtersKey];
      if (!item) {
        continue;
      }

      let filterValue: string;
      if (isGuid(item) || isListOfGuids(item)) {
        filterValue = filtersKey + SieveOperators.equalsOnly + parseValue(item);
      } else if (captionField[filtersKey]?.mode) {
        const sieveOperator = getSieveOperatorValue(captionField[filtersKey]?.mode);
        filterValue = filtersKey + sieveOperator + parseValue(item);
      } else {
        filterValue = filtersKey + SieveOperators.contains + parseValue(item);
      }
      params.add(filterValue);
    }
  }

  param.filters = Array.from(params).join(',');
  return param;
}

export function parseValue(value: any): string {
  if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(item => (item)).join('|');
  } else if (typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export function getSieveOperatorValue(mode: string): any {
  if (MatchMode.equals === mode) {
    return SieveOperators.equals;
  } else if (MatchMode.equalsOnly === mode) {
    return SieveOperators.equalsOnly;
  } else if (MatchMode.notEquals === mode) {
    return SieveOperators.notEquals;
  } else if (MatchMode.contains === mode) {
    return SieveOperators.contains;
  } else if (MatchMode.startsWith === mode) {
    return SieveOperators.startsWith;
  } else if (MatchMode.notContains === mode) {
    return SieveOperators.notContains;
  } else if (MatchMode.greaterThanOrEqual === mode) {
    return SieveOperators.greaterThanOrEqual;
  }
}

export function setTime(date: any, hour = 0, minute = 0, second = 0): string {
  return date.set({hour, minute, second}).format();
}
