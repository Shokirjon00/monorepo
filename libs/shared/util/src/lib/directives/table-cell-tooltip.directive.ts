import { Directive, ElementRef, HostListener, Input, Renderer2, AfterViewInit, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[emTableCellTooltip]',
  standalone: true
})
export class TableCellTooltipDirective implements AfterViewInit, OnDestroy {
  @Input('emTableCellTooltip') text: string = '';
  private tooltipElement: HTMLElement | null = null;
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroyTooltip();
  }

  ngAfterViewInit(): void {
    this.checkOverflow();
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private checkOverflow(): boolean {
    const element = this.el.nativeElement;
    return element.scrollWidth > element.clientWidth;
  }

  private createTooltip(): void {
    if (!this.checkOverflow() || this.tooltipElement) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.tooltipElement.innerText = this.text;
    this.renderer.appendChild(document.body, this.tooltipElement);

    this.renderer.addClass(this.tooltipElement, 'smart-tooltip');
    this.renderer.addClass(this.tooltipElement, 'tooltip-hidden');

    const rect = this.el.nativeElement.getBoundingClientRect();
    document.body.appendChild(this.tooltipElement);

    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.removeClass(this.tooltipElement, 'tooltip-hidden');
        this.setPosition(rect);
      }
    }, 10);
  }

  private setPosition(rect: DOMRect): void {
    if (!this.tooltipElement) return;
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top = rect.bottom + 5;
    let left = rect.left;

    if (window.innerHeight < rect.bottom + tooltipRect.height + 10) {
      top = rect.top - tooltipRect.height - 5;
      this.renderer.addClass(this.tooltipElement, 'tooltip-top');
    } else {
      this.renderer.addClass(this.tooltipElement, 'tooltip-bottom');
    }

    if (window.innerWidth < rect.left + tooltipRect.width + 10) {
      left = rect.right - tooltipRect.width;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private destroyTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
