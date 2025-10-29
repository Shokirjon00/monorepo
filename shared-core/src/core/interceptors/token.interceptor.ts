import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment as env} from '@environments/environment';
import {TokenService} from '@core/services/token.service';
import {AuthService} from '@modules/auth/service/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
              private tokenService: TokenService) {
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let headers = {};
    if (!request.url.includes(env.api.refresh) && !request.url.includes(env.api.web)) {
      headers = {
        'Access-Control-Allow-Origin': '*',
        charset: 'utf-8'
      };
      headers = {
        setHeaders: {
          Authorization: `Bearer ${this.getToken(request.url)}`,
          ...headers
        }
      };
    }

    const tokenReq = request.clone(headers);
    return next.handle(tokenReq);
  }


  private getToken(url: string): string {
    if (url.includes(env.api.authenticate) || (url.includes(`/${env.api.setPassword}`) || url.includes(`/${env.api.identities}`)) && !url.includes(env.api.logout )) {
      return this.authService.temporaryToken;
    }

    return this.tokenService.accessToken;
  }
}
