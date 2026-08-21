import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() {
  }

  get(key: string): any {
    return sessionStorage.getItem(key);
  }

  set(key: string, value: any): void {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, value);
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
