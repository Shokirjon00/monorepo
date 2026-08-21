import { InjectionToken } from '@angular/core';

export type SieveOperatorResolver = (mode: string) => string;

export const SIEVE_OPERATOR_RESOLVER = new InjectionToken<SieveOperatorResolver>('SIEVE_OPERATOR_RESOLVER');
