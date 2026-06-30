import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  /**
   *  get from storage
   */
  get(key: string): any {
    return localStorage.getItem(key);
  }

  /**
   *  set data to storage
   */
  set(key: string, value: any): void {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, value);
  }

  /**
   *  remove data from storage
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   *  clear storage data
   */
  clear(): void {
    localStorage.clear();
  }
}
