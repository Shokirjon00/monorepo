import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AutocompleteCoordinatorService {
  private readonly openedSource = new Subject<symbol>();
  readonly opened$: Observable<symbol> = this.openedSource.asObservable();

  notifyOpened(id: symbol): void {
    this.openedSource.next(id);
  }
}
