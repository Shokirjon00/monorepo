import { provideClientHydration } from '@angular/platform-browser';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
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
  ],
};
