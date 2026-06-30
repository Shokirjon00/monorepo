import {IMaColumn, IQuickAction } from './interfaces/merchant-activity.interface';

export const MA_MERCHANTS_TOP_COLUMNS: IMaColumn[] = [
  { key: 'rank', label: '#', type: 'rank', flex: 0.4 },
  { key: 'name', label: 'Торговая точка', flex: 2 },
  { key: 'value', label: 'Оборот (TJS)', type: 'number', align: 'right', flex: 1.3 },
  { key: 'secondary', label: 'Доля, %', type: 'number', align: 'right', flex: 1 },
];

export const MA_NO_TX_COLUMNS: IMaColumn[] = [
  { key: 'rank', label: '#', type: 'rank', flex: 0.4 },
  { key: 'name', label: 'Торговая точка', flex: 2 },
];

export const MA_ERROR_COLUMNS: IMaColumn[] = [
  { key: 'code', label: 'Код', flex: 0.7 },
  { key: 'description', label: 'Описание', flex: 2.2 },
  { key: 'count', label: 'Кол-во', type: 'number', align: 'right', flex: 1 },
];

export const MA_TOP_COLUMNS: IMaColumn[] = [
  { key: 'rank', label: '#', type: 'rank', flex: 0.4 },
  { key: 'name', label: 'Торговая точка', flex: 2 },
  { key: 'value', label: 'Оборот (TJS)', type: 'number', align: 'right', flex: 1.3 },
  { key: 'percent', label: 'Доля, %', type: 'number', align: 'right', flex: 1 },
];

export const MA_QUICK_ACTIONS: IQuickAction[] = [
  { key: 'terminals-report', label: 'Отчёт по терминалам', icon: 'terminals-report.svg', colorKey: 'blue' },
  { key: 'export-tx', label: 'Экспорт транзакций', icon: 'export-tx.svg', colorKey: 'green' },
  { key: 'merchants-list', label: 'Список торговых точек', icon: 'merchants-list.svg', colorKey: 'purple' },
  { key: 'alerts', label: 'Настройка алёртов', icon: 'alerts.svg', colorKey: 'orange' },
  { key: 'add-widget', label: 'Добавить виджет', icon: 'add-widget.svg', colorKey: 'blue' },
];
