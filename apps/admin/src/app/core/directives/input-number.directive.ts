import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emInputNumber]'
})
export class InputNumberDirective {
  private _el = inject(ElementRef);

  @HostListener('input', ['$event']) onInputChange(event: Event): void {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
