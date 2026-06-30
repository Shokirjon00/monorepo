import { Injectable } from '@angular/core';
/**
 * @Deprecated use saveToLocalStorage & getFromLocalStorage
 */
@Injectable({
  providedIn: 'root'
})
export class SaveFiltersService {

  get(key: string): any {
    const filtersString = localStorage.getItem(key);
    if (filtersString) {
      return JSON.parse(filtersString);
    }
    return null;
  }

  save(key: string, filters: any): void {
    localStorage.setItem(key, JSON.stringify(filters));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  reset(): void {
    localStorage.clear();
  }

}
