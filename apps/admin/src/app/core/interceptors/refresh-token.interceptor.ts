import { inject, Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { environment as env } from '@environments/environment';
import { ErrorService } from '@core/services/error.service';
import { TokenService } from '@core/services/token.service';
import { AuthService } from '@modules/auth/service/auth.service';
import { ErrorStatusCodeEnum } from '@eskhata/util';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  isRefreshingToken = false;
  tokenSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  destroyQueue$ = new Subject();
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);
  private tokenService = inject(TokenService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req)
      .pipe(
        map((response: any) => {
          switch (response.body?.errorCode) {
            case ErrorStatusCodeEnum.TOKEN_EXPIRED:
              throw response;
            case ErrorStatusCodeEnum.TOKEN_REFRESH_EXPIRED:
              this.endSession();
              break;
            case ErrorStatusCodeEnum.ERROR_AUTH:
              this.endSession();
              break;
            default:
              return response;
          }
        }),
        catchError(error => {
          if (error.body?.errorCode === ErrorStatusCodeEnum.TOKEN_EXPIRED) {
            this.errorService.hasDialog = false;
            return this.handleRefreshError(req, next);
          }
          throw error;
        }),
      );
  }

  handleRefreshError(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      if (req.url.includes(env.api.authenticate)) {
        return this.getTempToken(next, req);
      }
      if (req.url.includes(env.api.identities)) {
        this.endSession();
        this.isRefreshingToken = false;
        return of(null);
      }
      if (this.tokenService.refreshToken?.length) {
        return this.authService.refresh()
          .pipe(
            switchMap(res => {
              if (res.status) {
                this.tokenService.setTokens(res.meta);
                this.tokenSubject$.next(this.tokenService.accessToken);
                // TODO only this case
              } else if (res.errorCode === ErrorStatusCodeEnum.BAD_REQUEST) {
                this.endSession();
                this.destroyQueue$.next(true);
              }
              return next.handle(req);
            }),
            finalize(() => this.isRefreshingToken = false)
          );
      } else {
        this.endSession();
        this.destroyQueue$.next(true);
        return next.handle(req);
      }
    } else {
      return this.tokenSubject$
        .pipe(
          filter(token => token != null),
          switchMap(() => next.handle(req)),
          takeUntil(this.destroyQueue$)
        );
    }
  }

  private getTempToken(next: HttpHandler, req: HttpRequest<any>): Observable<any> {
    return this.authService.login({username: '', password: ''})
      .pipe(
        switchMap((helloRes) => {
          this.authService.temporaryToken = helloRes.data.temporaryToken;
          return next.handle(req);
        }),
        finalize(() => this.isRefreshingToken = false)
      );
  }

  private endSession(): void {
    if (!this.errorService.hasDialog) {
      this.errorService.hasDialog = true;
      this.authService.endSession$.next(true);
    }
  }
}
