import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '@environments/environment';

@Injectable()
export class CustomHeadersInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(env.apiFoodUrl)) {
      const userId = sessionStorage.getItem('userId') || '';
      const companyId = sessionStorage.getItem('companyId') || '';
      const offsetMinutes = -new Date().getTimezoneOffset();
      const modifiedReq = request.clone({
        setHeaders: {
          'X-Offset-Time-In-Minute': offsetMinutes.toString(),
        },
      });

      return next.handle(modifiedReq);
    }

    return next.handle(request);
  }
}
