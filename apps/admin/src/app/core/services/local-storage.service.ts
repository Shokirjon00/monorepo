import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  get(key: string): any {
    return localStorage.getItem(key);
  }

  set(key: string, value: any): void {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
