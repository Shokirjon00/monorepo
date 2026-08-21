import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ICaption } from '@eskhata/util';

@Injectable({
  providedIn: 'root'
})
export class CaptionService {
   data$ = new BehaviorSubject<ICaption[]>(null);

  setCaption(caption: ICaption[]): void {
    this.data$.next(caption);
  }

  getCaption(): BehaviorSubject<ICaption[]> {
    return this.data$;
  }
}
