import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { DateFormatEnum } from '../enums/date-format.enum';

@Pipe({
  standalone: true,
  name: 'dateTime',
})
export class DateTimePipe implements PipeTransform {
  transform(value: string, defaultValue = '-'): string {
    if (value) {
      return moment(value).format(DateFormatEnum.DATE_TIME_LOCAL_FORMAT);
    }
    return defaultValue;
  }
}
