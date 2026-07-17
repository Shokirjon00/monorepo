import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'emNumber', standalone: true })
export class EmNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digitsInfo = '1.0-2'): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return '';
    return formatNumber(num, 'en-US', digitsInfo).replace(/,/g, ' ');
  }
}
