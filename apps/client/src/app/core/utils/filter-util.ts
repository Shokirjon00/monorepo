import { IFilterParams } from '@eskhata/util';
import { SieveOperators } from "@core/enums/sieve.enum";
import { isGuid, isListOfGuids } from '@eskhata/util';
import { ICaption } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export function parseFilterParams(
  filters: { [key: string]: any },
  param: IFilterParams,
  captions: ICaption[],
  excludeKeys: string[] = ['startDate', 'endDate']): IFilterParams {
  const reservedKeys = ['page', 'pageSize', 'module', 'sorts', 'filters'];
  const params: any = [];
  const captionField: any = {};
  captions.forEach(item => captionField[item.field] = item);
  for (const filtersKey in filters) {
    if (excludeKeys.includes(filtersKey)) {
      continue;
    }
    if (!reservedKeys.includes(filtersKey)) {
      const item = filters[filtersKey];
      if (!item) {
        continue;
      }

      let key = captionField[filtersKey]?.filterParams ?? filtersKey
      let mode = captionField[filtersKey]?.mode

      if ((isGuid(item) || isListOfGuids(item)) && !mode) {
        params.push(key + SieveOperators.equalsOnly + parseValue(item));
      } else if (mode) {
        params.push(key + getSieveOperatorValue(mode) + parseValue(item) + (mode === MatchMode.containsLike ? '/i' : ''));
      } else if (key === 'startedAt') {
        params.push(key + SieveOperators.equalsOnly + parseValue(item));
      } else if (filtersKey === 'IsArchived') {
        params.push(filtersKey + SieveOperators.equal + parseValue(item));
      } else if (key === 'ProductApplicationStatus') {
        params.push(key + SieveOperators.equal + parseValue(item));
      } else if (key === 'createdDateTime') {
        let dates = item.split(" ");
        params.push(key + SieveOperators.greaterThanOrEqual + parseValue(dates[0]));
        params.push(key + SieveOperators.lessThanOrEqual + parseValue(dates[1]));
      } else {
        params.push(key + SieveOperators.contains + parseValue(item));
      }
    }
  }
  param.filters = params.join(',');
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

export function getSieveOperatorValue(mode: string): string {
  if (MatchMode.equals === mode) {
    return SieveOperators.equals;
  } else if (MatchMode.equal === mode) {
    return SieveOperators.equal;
  } else if (MatchMode.containsLike === mode) {
    return SieveOperators.containsLike;
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
