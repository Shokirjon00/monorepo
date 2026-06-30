import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[emAppDecimalPrecision]'
})
export class DecimalPrecisionDirective {
    @Input('emAppDecimalPrecision') precision = 2;

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        if (value.includes('.')) {
            const [intPart, decimalPart] = value.split('.');
            if (decimalPart.length > this.precision) {
                input.value = `${intPart}.${decimalPart.slice(0, this.precision)}`;
            }
        }
    }
}
