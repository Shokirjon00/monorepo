import { Injectable, signal, WritableSignal } from '@angular/core';
import { IIRetailOutletDetail } from '@modules/company-registration/retail-outlet/interfaces/retail-outlet-detail.interfaces';

const STORAGE_KEY = 'retailOutletInfo';

@Injectable({ providedIn: 'root' })
export class RetailOutletStateService {
  retailOutletInfo: WritableSignal<IIRetailOutletDetail | null> = signal(
    this.loadFromStorage()
  );

  setRetailOutletInfo(info: IIRetailOutletDetail): void {
    this.retailOutletInfo.set(info);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }

  clear(): void {
    this.retailOutletInfo.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadFromStorage(): IIRetailOutletDetail | null {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      try {
        return JSON.parse(json);
      } catch {
        return null;
      }
    }
    return null;
  }
}
