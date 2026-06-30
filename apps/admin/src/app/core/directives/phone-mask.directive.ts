import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[formControlName][emPhoneMask]'
})
export class PhoneMaskDirective {
  readonly ngControl = inject(NgControl);

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onInputChange(value, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onInputChange(value, true);
  }


  onInputChange(value: string, backspace: boolean): void {
    let newVal = value.replace(/\D/g, '');
    if (backspace && newVal.length <= 6) {
      newVal = newVal.substring(0, newVal.length - 1);
    }
    if (newVal.length === 0) {
      newVal = '';
    } else if (newVal.length <= 3) {
      newVal = '+' + newVal.replace(/^(\d{0,3})/, '($1)');
    } else if (newVal.length <= 6) {
      newVal = '+' + newVal.replace(/^(\d{0,3})(\d{0,2})/, '($1)-$2');
    } else if (newVal.length <= 10) {
      newVal = '+' + newVal.replace(/^(\d{0,3})(\d{0,2})(\d{0,3})/, '($1)-$2-$3');
    } else if (newVal.length <= 12) {
      newVal = '+' + newVal.replace(/^(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})/, '($1)-$2-$3-$4');
    } else {
      newVal = newVal.substring(0, 12);
      newVal = '+' + newVal.replace(/^(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})/, '($1)-$2-$3-$4');
    }
    this.ngControl.valueAccessor.writeValue(newVal);
  }

}
