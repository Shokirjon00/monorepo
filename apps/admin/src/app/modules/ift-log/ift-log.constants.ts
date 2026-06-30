import {ICaption} from "@core/interfaces/table.interface";

export class IFTLogConstants {

  static readonly IFTLOG_COLUMNS : ICaption[] = [
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Название сообщения',
      field: 'messageName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Тип сообщения',
      field: 'messageType',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Тип лога',
      field: 'logType',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Описание ошибки',
      field: 'errorDescription',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Дата запроса',
      field: 'requestDateTime',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '170px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    }
  ]
}

