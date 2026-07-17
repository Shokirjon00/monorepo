import { provideClientHydration } from "@angular/platform-browser";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideAngularSvgIcon } from "angular-svg-icon";
import { provideNgxMask } from "ngx-mask";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpErrorInterceptor } from "@core/interceptors/http-error.interceptor";
import { ErrorService } from "@core/services/error.service";
import { AuthService } from "@modules/auth/service/auth.service";
import { provideRouter, Router } from "@angular/router";
import { TokenService } from "@core/services/token.service";
import { RefreshTokenInterceptor } from "@core/interceptors/refresh-token.interceptor";
import { TokenInterceptor } from "@core/interceptors/token.interceptor";
import { AnonymousUserGuard } from "@core/guards/anonymous-user.guard";
import { AuthenticatedUserGuard } from "@core/guards/authenticated-user.guard";
import { MatDialogModule } from "@angular/material/dialog";
import { APP_ROUTES } from "./app.routing";
import { NgxPermissionsModule } from "ngx-permissions";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "@environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      MatDialogModule,
      NgxPermissionsModule.forRoot(),
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        registrationStrategy: 'registerWhenStable:30000'
      }),
    ),
    provideRouter(APP_ROUTES),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideAngularSvgIcon(),
    provideNgxMask(),
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
    AnonymousUserGuard,
    AuthenticatedUserGuard,
  ],
};
