import { computed, Injectable, Signal, signal } from '@angular/core';
import { Params } from '@angular/router';

@Injectable()
export abstract class BaseFilterStore<T extends object> {
  protected readonly _filter = signal<T>(this.createDefault());

  readonly filter: Signal<T> = this._filter.asReadonly();
  readonly params = computed<Params>(() => this.toParams(this._filter()));

  patch(part: Partial<T>): void {
    this._filter.update(current => ({ ...current, ...part }));
  }

  reset(): void {
    this._filter.set(this.createDefault());
  }

  protected abstract createDefault(): T;

  protected toParams(filter: T): Params {
    return Object.entries(filter).reduce<Params>((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}
