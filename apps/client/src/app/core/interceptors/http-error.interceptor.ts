import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorStatusCodeEnum } from '@core/enums/error-status-codes.enum';
import { ErrorService } from '@core/services/error.service';
import { Router } from '@angular/router';
import { environment as env } from '@environments/environment';
import { TokenService } from '@core/services/token.service';
import { AuthService } from "@modules/auth/service/auth.service";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ErrorTextConstants } from "@core/constants/error-text.constants";
import { inject } from '@angular/core';

export class HttpErrorInterceptor implements HttpInterceptor {
  private errorService= inject(ErrorService);
  private authService= inject(AuthService);
  private router= inject(Router);
  private tokenService= inject(TokenService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        tap((response: any) => {
          if (response?.body?.hasOwnProperty('status') && !response?.body?.status) {
            this.errorHandler(response);
          }
        }),
        catchError(err => {
          this.errorService.hasDialog = false;
          if (err.status === 401) {
            this.logout();
            return throwError(err);
          } else if (err.status === 500 || !navigator.onLine) {
            this.showError(err);
          }
          return throwError(err);
        })
      );
  }

  private errorHandler(response: HttpResponse<IHttpResponse<any>>): void {
    // TODO Refactoring
    switch (response?.body?.errorCode) {
      case ErrorStatusCodeEnum.ERROR_AUTH:
        this.logout();
        break;
      case ErrorStatusCodeEnum.TOKEN_REFRESH_EXPIRED:
        if (this.router.url.includes(env.api.identities)) {
          this.logout();
        }
        break;
      case ErrorStatusCodeEnum.UNKNOWN_EXCEPTION:
        break;
    }
  }

  private logout(): void {
    this.authService.temporaryToken = null;
    this.tokenService.clearTokens();
    this.router.navigate(['/auth']).catch();
  }

  private showError(err: HttpErrorResponse): void {
    if (!this.errorService.hasDialog) {
      if (err.status === 500) {
        if (err) {
          this.errorService.hasDialog = true;
          this.errorService.showAlert({
            title: ErrorTextConstants.UNKNOWN_SERVER_ERROR
          })
        }
      } else if (!navigator.onLine) {
        this.errorService.hasDialog = true;
        this.errorService.showAlert({
          title: ErrorTextConstants.NO_INTERNET_CONNECTION
        })
      }
    }
  }
}
