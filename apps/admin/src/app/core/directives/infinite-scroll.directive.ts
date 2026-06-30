import {
  Directive,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  inject, input, DestroyRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPaginate } from "@core/interfaces";

@Directive({
  standalone: true,
  selector: '[emInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit {

  readonly pagination = input<IPaginate | null>(null);
  readonly selector = input<string>('.main-body');
  @Output() emInfiniteScroll = new EventEmitter<void>();
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    queueMicrotask(() => this.initPaginator());
  }

  private initPaginator(): void {
    const element =
      (this.document.querySelector(this.selector()) as HTMLElement) ||
      this.elementRef.nativeElement;

    fromEvent(element, 'scroll')
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const pagination = this.pagination();
        if (
          pagination?.hasNextPage &&
          element.scrollTop + element.clientHeight + 100 >= element.scrollHeight
        ) {
          this.emInfiniteScroll.emit();
        }
      });
  }
}
