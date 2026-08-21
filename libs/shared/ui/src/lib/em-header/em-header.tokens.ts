import { InjectionToken, Type } from '@angular/core';

export type MainFilterDialogLoader = () => Promise<Type<unknown>>;

export const MAIN_FILTER_DIALOG = new InjectionToken<MainFilterDialogLoader>('MAIN_FILTER_DIALOG');

export const ADVANCE_PAYMENTS_HEADER = new InjectionToken<() => boolean>('ADVANCE_PAYMENTS_HEADER', {
  providedIn: 'root',
  factory: () => () => false,
});
