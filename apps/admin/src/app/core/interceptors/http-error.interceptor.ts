import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorStatusCodeEnum, ErrorTextConstants } from '@eskhata/util';
import { ErrorService } from '@core/services/error.service';
import { Router } from '@angular/router';
import { environment as env } from '@environments/environment';
import { TokenService } from '@core/services/token.service';
import { AuthService } from '@modules/auth/service/auth.service';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { inject } from "@angular/core";

export class HttpErrorInterceptor implements HttpInterceptor {
  private errorService = inject(ErrorService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        tap((response: any) => {
          if (response?.body?.hasOwnProperty('status') && !response?.body?.status) {
            this._errorHandler(response);
          }
        }),
        catchError(err => {
          this.errorService.hasDialog = false;
          if (err.status === 401) {
            this._logout();
            return throwError(err);
          } else if (err.status === 500 || !navigator.onLine) {
            this._showError(err);
          }
          return throwError(err);
        })
      );
  }

  private _errorHandler(response: HttpResponse<IHttpResponse<any>>): void {
    // TODO Refactoring
    switch (response?.body?.errorCode) {
      case ErrorStatusCodeEnum.ERROR_AUTH:
        this._logout();
        break;
      case ErrorStatusCodeEnum.TOKEN_REFRESH_EXPIRED:
        if (this.router.url.includes(env.api.identities)) {
          this._logout();
        }
        break;
      case ErrorStatusCodeEnum.UNKNOWN_EXCEPTION:
        break;
      // default:
      //   if (!this._errorService.hasDialog) {
      //     this._errorService.show$.next({body: response?.body?.message || ErrorTextConstants.UNKNOWN_SERVER_ERROR});
      //   }
    }
  }

  private _logout(): void {
    this.authService.temporaryToken = null;
    this.tokenService.clearTokens();
    this.router.navigate(['/auth'])
      .catch();
  }

  private _showError(err: HttpErrorResponse): void {
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
