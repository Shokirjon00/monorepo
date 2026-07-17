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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[emScrollEvent]'
})
export class ScrollEventDirective implements OnInit {
  readonly emScrollEvent = output<any>();
  readonly selector = input('.main-body');
  readonly scrollTopHeight = input<number>(500);
  private document = inject(DOCUMENT);
  private elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    queueMicrotask(() =>  this.initScroll());
  }

  private initScroll(): void {
    const element: HTMLElement = this.document.querySelector(this.selector()) || this.elementRef.nativeElement;
    fromEvent(element, 'scroll')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emScrollEvent.emit(element.scrollTop > this.scrollTopHeight()));
  }
}
