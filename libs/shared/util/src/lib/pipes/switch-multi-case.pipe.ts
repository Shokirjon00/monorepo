import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiCase',
  standalone: true,
  pure: true,
})
export class SwitchMultiCasePipe implements PipeTransform {
  transform(cases: string[], value: string): string {
    if (!value) {
      return '';
    }
    return cases.includes(value) ? value : '';
  }
}
