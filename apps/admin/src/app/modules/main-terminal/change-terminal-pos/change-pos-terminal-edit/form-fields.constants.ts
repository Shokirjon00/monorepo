import { IChangePosTerminalUpdate } from '../interfaces/change-pos-terminal.interface';
import {
  IDateField,
  ITextField
} from "@modules/main-terminal/change-terminal-pos/change-pos-terminal-edit/form-fields.interface";

export const INFO_ROWS_CONFIG: ReadonlyArray<{
  key: string;
  field: keyof IChangePosTerminalUpdate;
  isDate?: boolean;
}> = [
  { key: 'ID терминала', field: 'terminalId' },
  { key: 'Тип POS', field: 'posTypeName' },
  { key: 'Компания', field: 'companyName' },
  { key: 'Мерчант', field: 'merchantName' },
  { key: 'Наименование POS', field: 'posName' },
  { key: 'Адрес мерчанта', field: 'merchantAddress' },
  { key: 'SN терминала', field: 'terminalSerialNumber' },
  { key: 'Дата создания', field: 'createdAt', isDate: true },
];

export const DATE_FIELDS: ReadonlyArray<IDateField> = [
  { control: 'letterDate', label: 'Дата письма' },
  { control: 'offerDate', label: 'Дата предложения' },
  { control: 'installationActDate', label: 'Дата акта установки' },
  { control: 'removalActDate', label: 'Дата акта снятия' },
];

export const TERMINAL_STATUSES: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'a2050cf2-035b-45a3-85bb-ec88a3c96043', name: 'Активен' },
  { id: 'b1c8e5e7-9a3d-4c8b-9f0d-2e5f6a7b8c9d', name: 'Закрытый' },
  { id: 'c3d9f6e8-7a4b-4d9c-8e1f-3a6b7c8d9e0f', name: 'В Обработке' },
];
