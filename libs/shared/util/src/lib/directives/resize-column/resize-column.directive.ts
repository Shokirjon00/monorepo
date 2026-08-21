import {AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, Renderer2, input, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emResizeColumn]',
})
export class ResizeColumnDirective implements AfterViewInit, OnDestroy {
  readonly resizable = input<boolean>(undefined, { alias: "emResizeColumn" });

  readonly index = input<number>();

  readonly offset = input<number>(0);

  private startX: number;
  private startWidth: number;
  private table: HTMLElement;
  private pressed: boolean;
  private resizerEl: HTMLElement;
  private unListenMouseDown: () => void;
  private unListenMouseMove: () => void;
  private unListenMouseUp: () => void;
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  private ngZone = inject(NgZone);

  private column = this.el.nativeElement;

  ngOnDestroy(): void {
    if (this.table) {
      this.unListenMouseDown();
    }
  }

  ngAfterViewInit(): void {
    if (this.resizable()) {
      const row = this.renderer.parentNode(this.column);
      const thead = this.renderer.parentNode(row);
      this.table = this.renderer.parentNode(thead);

      if (!this.table) {
        return;
      }

      this.resizerEl = this.renderer.createElement('span');
      this.renderer.addClass(this.resizerEl, 'resize-holder');
      this.renderer.appendChild(this.column, this.resizerEl);
      this.unListenMouseDown = this.renderer.listen(this.resizerEl, 'mousedown', this.onMouseDown);
    }
  }

  onMouseDown = (event: MouseEvent): void => {
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
    this.ngZone.runOutsideAngular(() => {
      this.unListenMouseMove = this.renderer.listen(this.table, 'mousemove', this.onMouseMove);
      this.unListenMouseUp = this.renderer.listen('document', 'mouseup', this.onMouseUp);
    })
  };

  onMouseMove = (event: MouseEvent): void => {
    if (this.pressed && event.buttons) {
      this.renderer.addClass(this.table, 'resizing');

      const width = this.startWidth + (event.pageX - this.startX - this.offset());
      const tableCells: HTMLElement[] = Array.from(this.table.querySelector('tbody').children)
        .map((row: any) => row.children[this.index()]);

      this.renderer.setStyle(this.column, 'width', `${width}px`);
      this.renderer.setStyle(this.column, 'max-width', `${width}px`);

      for (const cell of tableCells) {
        this.renderer.setStyle(cell, 'width', `${width}px`);
        this.renderer.setStyle(cell, 'max-width', `${width}px`);
      }
    }
  };

  onMouseUp = (event: MouseEvent): void => {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, 'resizing');
    }
    this.unListenMouseMove();
    this.unListenMouseUp();
  };
}
