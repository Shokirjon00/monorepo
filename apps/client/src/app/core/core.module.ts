import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from '@core/interceptors/token.interceptor';
import { Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { AuthService } from "@modules/auth/service/auth.service";
import { RefreshTokenInterceptor } from "@core/interceptors/refresh-token.interceptor";
import { ErrorService } from "@core/services/error.service";
import { MatDialogModule } from "@angular/material/dialog";
import { HttpErrorInterceptor } from "@core/interceptors/http-error.interceptor";
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AuthenticatedUserGuard } from '@core/guards/authenticated-user.guard';
import { AnonymousUserGuard } from '@core/guards/anonymous-user.guard';
import { CustomHeadersInterceptor } from "@core/interceptors/custom.interceptor";

@NgModule({
  imports: [
    HttpClientModule,
    MatDialogModule,
    MatBottomSheetModule,
  ],
  providers: [
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
    AuthenticatedUserGuard
  ]
})
export class CoreModule {
}
