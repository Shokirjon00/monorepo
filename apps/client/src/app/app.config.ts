import { provideClientHydration } from '@angular/platform-browser';
import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { APP_ROUTES } from './app.routing';
import { provideRouter, Router } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TokenInterceptor } from '@core/interceptors/token.interceptor';
import { HttpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { RefreshTokenInterceptor } from '@core/interceptors/refresh-token.interceptor';
import { ErrorService } from '@core/services/error.service';
import { AuthService } from '@modules/auth/service/auth.service';
import { TokenService } from '@core/services/token.service';
import { CustomHeadersInterceptor } from '@core/interceptors/custom.interceptor';
import { provideNgxMask } from 'ngx-mask';
import { environment } from '@environments/environment';
import { ENVIRONMENT } from '@eskhata/environment';
import { FILTER_PARAMS_PARSER } from '@eskhata/data-access';
import { ADVANCE_PAYMENTS_HEADER, MAIN_FILTER_DIALOG, TABLE_CONFIG } from '@eskhata/ui';
import { bannerAmountSignal } from '@shared/components/banner/banner-signal';
import { SIEVE_OPERATOR_RESOLVER } from '@eskhata/data-access';
import { getSieveOperatorValue, parseFilterParams } from '@core/utils/filter-util';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideAngularSvgIcon(),
    provideAnimations(),
    provideNgxMask(),
    provideRouter(APP_ROUTES),
    importProvidersFrom(NgxPermissionsModule.forRoot()),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      deps: [ErrorService, AuthService, Router, TokenService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true,
      deps: [AuthService, ErrorService, Router, TokenService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
      deps: [AuthService, TokenService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHeadersInterceptor,
      multi: true,
    },
    { provide: ENVIRONMENT, useValue: environment },
    { provide: FILTER_PARAMS_PARSER, useValue: parseFilterParams },
    { provide: SIEVE_OPERATOR_RESOLVER, useValue: getSieveOperatorValue },
    {
      provide: MAIN_FILTER_DIALOG,
      useValue: () => import('@shared/dialogs/main-filter/main-filter.component').then(m => m.MainFilterComponent),
    },
    {
      provide: ADVANCE_PAYMENTS_HEADER,
      useFactory: () => {
        const router = inject(Router);
        return () => router.url.split('?')[0] === '/advance-payments' && bannerAmountSignal().isBannerVisible === true;
      },
    },
    { provide: TABLE_CONFIG, useValue: { loader: 'bank', download: 'save' } },
  ],
};
