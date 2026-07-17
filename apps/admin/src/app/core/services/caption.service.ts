import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICaption } from '@core/interfaces/table.interface';

@Injectable({providedIn: 'root'})

export class CaptionService {

   private data$ = new BehaviorSubject<{caption: ICaption[], key?: string}>(null);
   private key$ = new BehaviorSubject<string>('');

  setCaption(caption: ICaption[], key?: string): void {
    this.data$.next({caption: caption, key: key});
  }

  getCaption(): BehaviorSubject<{caption: ICaption[], key?: string}> {
    return this.data$;
  }

  setLocalStorageKey(key: string): void {
    this.key$.next(key);
  }

  getLocalStorageKey(): BehaviorSubject<string> {
    return this.key$;
  }
}
