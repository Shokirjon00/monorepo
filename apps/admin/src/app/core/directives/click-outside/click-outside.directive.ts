import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';
import {DestroyableComponent} from '@core/abstract/destroyable.component';

@Directive({
  selector: '[emClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective extends DestroyableComponent {
  @Output('emClickOutside') clickOutside: EventEmitter<any> = this.register(new EventEmitter());
  private elementRef = inject(ElementRef)

  @HostListener('document:click', ['$event.target'])
  onMouseEnter(targetElement: any): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit(null);
    }
  }

}
