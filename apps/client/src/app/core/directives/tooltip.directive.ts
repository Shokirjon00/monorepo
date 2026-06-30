import { Directive, ElementRef, HostListener, Renderer2, input, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emTooltip]'
})
export class TooltipDirective {
  readonly tooltipTitle = input<string>(undefined, { alias: "emTooltip" });
  readonly placement = input<string>();
  readonly delay = input<number>();
  tooltip: HTMLElement;
  offset = 10;
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter') onMouseEnter(): void {
    if (!this.tooltip) { this.show(); }
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    if (this.tooltip) { this.hide(); }
  }

  show(): void {
    this.create();
    this.setPosition();
    this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
  }

  hide(): void {
    this.renderer?.removeClass(this.tooltip, 'ng-tooltip-show');
    window.setTimeout(() => {
      this.renderer?.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }, this.delay());
  }

  create(): void {
    this.tooltip = this.renderer.createElement('span');

    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(this.tooltipTitle())
    );

    this.renderer.appendChild(document.body, this.tooltip);
    this.renderer.addClass(this.tooltip, 'ng-tooltip');
    this.renderer.addClass(this.tooltip, `ng-tooltip-${this.placement()}`);
    const delay = this.delay();
    this.renderer.setStyle(this.tooltip, '-webkit-transition', `opacity ${delay}ms`);
    this.renderer.setStyle(this.tooltip, '-moz-transition', `opacity ${delay}ms`);
    this.renderer.setStyle(this.tooltip, '-o-transition', `opacity ${delay}ms`);
    this.renderer.setStyle(this.tooltip, 'transition', `opacity ${delay}ms`);
  }

  setPosition(): void {
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip.getBoundingClientRect();
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let top, left;

    const placement = this.placement();
    if (placement === 'top') {
      top = hostPos.top - tooltipPos.height - this.offset;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    if (placement === 'bottom') {
      top = hostPos.bottom + this.offset;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    if (placement === 'left') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.left - tooltipPos.width - this.offset;
    }

    if (placement === 'right') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.right + this.offset;
    }

    this.renderer.setStyle(this.tooltip, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }
}
