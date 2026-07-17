/**
 * get from local storage
 */
export function getFromLocalStorage(storageKey: string): any {
  const data = localStorage.getItem(storageKey);
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * get from local storage
 */
export function getFromSessionStorage(storageKey: string): any {
  const data = sessionStorage.getItem(storageKey);
  try {
    return JSON.parse(data);
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
  localStorage.setItem(storageKey, JSON.stringify(data));
}


/**
 * save to session storage
 */

export function setToSessionStorage(storageKey: string, data: any): void {
  if (!storageKey) {
    throw Error('Storage key is missing');
  }
  sessionStorage.setItem(storageKey, JSON.stringify(data));
}
