import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
  standalone: true,
})
export class SplitPipe implements PipeTransform {

  transform(text: any, pattern: string = '.', index: number = 0): string {
    return String(text).split(pattern)[index] || null;
  }
}
