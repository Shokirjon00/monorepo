import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[emClickOutside]',
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  clickOutside = output<any>({ alias: 'emClickOutside' });

  @HostListener('document:click', ['$event.target'])
  onMouseEnter(targetElement: any): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit(null);
    }
  }
}
