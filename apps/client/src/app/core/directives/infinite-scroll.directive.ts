import {
  Directive,
  ElementRef,
  OnInit,
  input,
  DOCUMENT,
  inject,
  DestroyRef, output,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[emInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit {
  readonly pagination = input<IPaginate>();
  readonly emInfiniteScroll = output();
  readonly selector = input('.main-body');
  private document = inject(DOCUMENT);
  private elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    queueMicrotask(() => this._initPaginator());
  }

  private _initPaginator(): void {
    const element: HTMLElement = this.document.querySelector(this.selector()) || this.elementRef.nativeElement;
    fromEvent(element, 'scroll')
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (element.scrollTop + element.clientHeight + 100 >= element.scrollHeight) {
          if (this.pagination()?.hasNextPage) {
            this.emInfiniteScroll.emit();
          }
        }
      });
  }
}
