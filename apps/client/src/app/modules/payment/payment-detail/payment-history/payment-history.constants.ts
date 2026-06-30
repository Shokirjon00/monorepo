import { ICaption } from '@core/interfaces/table1.interface';

export class PaymentHistoryConstants {
  static readonly PAYMENT_HISTORY_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'paymentStatusGroupName',
      type: 'indicator',
      filterType: 'text',
      isSelected: true,
      isFiltered: true,
      width: "155px"
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Изменен',
      field: 'modifiedAt',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Пользователь',
      field: 'userName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Комментарии',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
  ]
}
