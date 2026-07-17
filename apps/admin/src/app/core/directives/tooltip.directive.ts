import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emTooltip]'
})
export class TooltipDirective {
  @Input('emTooltip') tooltipText?: string;
  private tooltipElement: HTMLElement | null = null;

  private showTooltip(event: MouseEvent): void {
    if (this.tooltipText) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.textContent = this.tooltipText;
      this.tooltipElement.classList.add('hover-tooltip');
      this.tooltipElement.style.top = `${event.pageY + 25}px`;
      this.tooltipElement.style.left = `${event.pageX - 350}px`;
      this.tooltipElement.style.position = 'absolute';
      this.tooltipElement.style.backgroundColor = '#DFE2E6';
      this.tooltipElement.style.color = '#000';
      this.tooltipElement.style.padding = '12px';
      this.tooltipElement.style.borderRadius = '12px';
      this.tooltipElement.style.zIndex = '10';
      this.tooltipElement.style.right = '40px';
      document.body.appendChild(this.tooltipElement);
    }
  }

  private hideTooltip(): void {
    if (this.tooltipElement) {
      document.body.removeChild(this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    this.showTooltip(event);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }
}
