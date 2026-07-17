import { Params } from '@angular/router';
import { QrPosChannel } from '@core/enums/qr-pos-enum';
import { ISelectedLabel, IStaticOption } from './qr-pos-filters.interface';

export const sameParams = (a: Params, b: Params): boolean => JSON.stringify(a) === JSON.stringify(b);

export const labelOf = (name: string, icon = ''): ISelectedLabel => ({ name, icon });

export const idOf = (value: string | { id?: string } | null | undefined): string =>
  typeof value === 'string' ? value : (value?.id ?? '');

export const QR_POS_FILTER_DEFAULTS = {
  date: (): ISelectedLabel => labelOf('Сегодня', 'day.svg'),
  company: (): ISelectedLabel => labelOf('Все организации', 'company.svg'),
  merchant: (): ISelectedLabel => labelOf('Все торговые точки'),
  pos: (): ISelectedLabel => labelOf('Все кассы'),
  channel: (): ISelectedLabel => labelOf('Все'),
  status: (): ISelectedLabel => labelOf('Все'),
  region: (): ISelectedLabel => labelOf('Все регионы'),
  currency: (): ISelectedLabel => labelOf('TJS', 'company.svg'),
};

export const QR_POS_CHANNEL_OPTIONS: IStaticOption[] = [
  { id: QrPosChannel.All, name: 'Все' },
  { id: QrPosChannel.Qr, name: 'QR' },
  { id: QrPosChannel.Pos, name: 'POS' },
];

export const QR_POS_STATUS_OPTIONS: IStaticOption[] = [
  { id: '', name: 'Все' },
  { id: '2af0a02a-b7e3-11ec-8adb-705a0fd15962', name: 'Успешно' },
  { id: '8e023707-b7e3-11ec-8adb-705a0fd15962', name: 'Отказано' },
];

export const QR_POS_DATE_TYPE_IMAGES = ['day.svg', 'day.svg', 'week.svg', 'month.svg', 'year.svg', 'period.svg'];
