import { ICaption } from "@core/interfaces/table.interface";

export class MobileAppConstants {

  static readonly MOBILE_APP_COLUMNS: ICaption[] = [
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Модель',
      field: 'model',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Версия приложения',
      field: 'appVersion',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Операционная система',
      field: 'os',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
  ];
}


