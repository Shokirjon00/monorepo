import { InjectionToken } from '@angular/core';
import { Environment } from './environment';

/**
 * The concrete `environment` object lives in each application (and is swapped per
 * build configuration via `fileReplacements`), so shared libraries cannot import
 * it directly. Each app provides this token with its own environment instead.
 */
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');
