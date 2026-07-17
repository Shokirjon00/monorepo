import {Pipe, PipeTransform} from '@angular/core';
import {DateFormatEnum} from '@core/enums/date-format.enum';
import moment from 'moment';

@Pipe({
  standalone: true,
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {
  transform(value: string, defaultValue = '-'): string {
    if (value) {
      return moment(value).format(DateFormatEnum.DATE_TIME_LOCAL_FORMAT);
    }
    return defaultValue;
  }
}
