export const FILTER_LIFETIME_MS = 2 * 60 * 60 * 1000;

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

export function setToLocalStorage(storageKey: string, data: any): void {
  if (!storageKey) {
    throw Error('Storage key is missing');
  }

  const dataWithTimestamp =
    storageKey === 'payments-filters'
      ? data
      : {
          ...data,
          _timestamp: new Date().getTime(),
        };

  localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
}

export function removeFilterFromStorage(key: string): void {
  try {
    if (key && typeof key === 'string' && key.trim()) {
      localStorage.removeItem(key.trim());
    }
  } catch (error) {
    console.error('Error removing filter from localStorage:', error);
  }
}

export function getFromSessionStorage(storageKey: string): any {
  const data = sessionStorage.getItem(storageKey);
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setToSessionStorage(storageKey: string, data: any): void {
  if (!storageKey) {
    throw Error('Storage key is missing');
  }
  sessionStorage.setItem(storageKey, JSON.stringify(data));
}
