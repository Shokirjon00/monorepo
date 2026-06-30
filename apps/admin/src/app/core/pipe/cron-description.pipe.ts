import { Pipe, PipeTransform } from '@angular/core';
import cronstrue from 'cronstrue';

@Pipe({
  standalone: true,
  name: 'cronDescription'
})
export class CronDescriptionPipe implements PipeTransform {
  transform(expression: string | null | undefined): string {
    if (!expression) {
      return '';
    }
    try {
      return cronstrue.toString(expression, { locale: 'ru' });
    } catch {
      return 'Неверно указано значение';
    }
  }
}
