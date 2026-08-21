import { InjectionToken } from '@angular/core';

export interface TableConfig {
  loader: 'skeleton' | 'bank';
  download: 'open' | 'save';
}

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  loader: 'skeleton',
  download: 'open',
};

export const TABLE_CONFIG = new InjectionToken<TableConfig>('TABLE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_TABLE_CONFIG,
});
