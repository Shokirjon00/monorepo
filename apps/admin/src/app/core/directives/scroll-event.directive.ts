import { Directive, ElementRef, EventEmitter, Input, OnInit, Output, DOCUMENT, inject } from '@angular/core';

import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DestroyableComponent } from '@eskhata/util';

@Directive({
  standalone: true,
  selector: '[emScrollEvent]'
})
export class ScrollEventDirective extends DestroyableComponent implements OnInit {
  @Output() emScrollEvent: EventEmitter<any> = new EventEmitter();
  @Input() selector = '.main-body';
  @Input() scrollTopHeight: number = 500;

  private elementRef = inject(ElementRef);
  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.setTimeout(() => this.initScroll(), 1000);
  }

  private initScroll(): void {
    const element: HTMLElement = this.document.querySelector(this.selector) || this.elementRef.nativeElement;
    fromEvent(element, 'scroll')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.emScrollEvent.emit(element.scrollTop > this.scrollTopHeight));
  }
}
