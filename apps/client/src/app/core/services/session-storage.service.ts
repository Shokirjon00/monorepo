import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() {
  }

  /**
   *  get from storage
   */
  get(key: string): any {
    return sessionStorage.getItem(key);
  }

  /**
   *  set data to storage
   */
  set(key: string, value: any): void {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, value);
  }

  /**
   *  remove data from storage
   */
  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   *  clear storage data
   */
  clear(): void {
    sessionStorage.clear();
  }
}
