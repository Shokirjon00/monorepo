import {Directive, OnDestroy} from '@angular/core';
import {Subject, Subscription, takeUntil, timer} from 'rxjs';

@Directive()
// eslint:disable-next-line:directive-class-suffix
export abstract class DestroyableComponent implements OnDestroy {
  protected readonly destroyed$ = new Subject<boolean>();
  protected readonly completable: Subject<any>[] = [];

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    this.completable.map(s => s.complete());
    this.completable.splice(0);
  }

  protected register<T extends Subject<any>>(instance: T): T {
    this.completable.push(instance);
    return instance;
  }

  protected setTimeout(func: () => void, timeout: number): Subscription {
    return timer(timeout)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(func);
  }
}
