import {
  ApplicationConfig, importProvidersFrom,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { ErrorService } from '@shared-core/data-access/error.service';
import { AuthService } from '@shared-core/data-access/auth.service';
import { TokenService } from '@shared-core/data-access/token.service';
import { RefreshTokenInterceptor } from '@core/interceptors/refresh-token.interceptor';
import { TokenInterceptor } from '@core/interceptors/token.interceptor';
import { CustomHeadersInterceptor } from '@core/interceptors/custom.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideAngularSvgIcon(),
    provideAnimations(),
    provideRouter(APP_ROUTES),
    importProvidersFrom(NgxPermissionsModule.forRoot()),
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      deps: [ErrorService, AuthService, Router, TokenService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true,
      deps: [AuthService, ErrorService, Router, TokenService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
      deps: [AuthService, TokenService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHeadersInterceptor,
      multi: true
    },
  ],
};
