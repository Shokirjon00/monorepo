import {FILTER_LIFETIME_MS} from "@core/helper";

export {isEmptyObject} from './is-empty-object'
export {setDefaultFilterValue} from './route-param-parse'
export {parseFilterParams} from './filter-util'

/**
 * get OS name Linux|Windows|IOS
 */
export function getOSName(): string {
  let name = 'Unknown OS';
  if (navigator.userAgent.indexOf('Win') !== -1) {
    name = 'Windows OS';
  }
  if (navigator.userAgent.indexOf('Mac') !== -1) {
    name = 'Macintosh';
  }
  if (navigator.userAgent.indexOf('Linux') !== -1) {
    name = 'Linux OS';
  }
  if (navigator.userAgent.indexOf('Android') !== -1) {
    name = 'Android OS';
  }
  if (navigator.userAgent.indexOf('like Mac') !== -1) {
    name = 'iOS';
  }

  return name;
}


/**
 * get from local storage
 */
export function getFromLocalStorage(storageKey: string): any {
  const data = localStorage.getItem(storageKey);
  try {
    const parsedData = JSON.parse(data);

    if (storageKey !== 'payments-filters' && parsedData && parsedData._timestamp) {
      const currentTime = new Date().getTime();
      if (currentTime - parsedData._timestamp > FILTER_LIFETIME_MS) {
        localStorage.removeItem(storageKey);
        return null;
      }
    }

    return parsedData;
  } catch (e) {
    return null;
  }
}


/**
 * save to local storage
 */

export function setToLocalStorage(storageKey: string, data: any): void {
  if (!storageKey) {
    throw Error('Storage key is missing');
  }

  const dataWithTimestamp = storageKey === 'payments-filters'
    ? data
    : {
      ...data,
      _timestamp: new Date().getTime()
    };

  localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
}

/**
 * remove to local storage
 */

export function removeFilterFromStorage(key: string): void {
  try {
    if (key && typeof key === 'string' && key.trim()) {
      localStorage.removeItem(key.trim());
    }
  } catch (error) {
    console.error('Error removing filter from localStorage:', error);
  }
}
