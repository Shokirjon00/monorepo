import {ICaption} from "@core/interfaces/table.interface";

export const withdrawalAmountSettingDetailColumns : ICaption[] = [
  {
    key: 'Наименование',
    field: 'name',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Период',
    field: 'issueMoneyPeriodTypeName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Время',
    field: 'runAt',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Конечное время',
    field: 'finishAt',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true
  }
]
