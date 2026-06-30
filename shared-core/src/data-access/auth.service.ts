import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { TokenService } from './token.service';
import { IHttpResponse } from '../core/interfaces/http-response.interface';
import { ILogin } from '../core/interfaces/login.interface';
import { environment as env} from '@env';
import { getOSName } from '../core/utils';
import { DEVICE_ID } from '../helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  endSession$ = new Subject<boolean>();
  temporaryToken: any;
  private apiUrl = `${env.apiUrlClient}/${env.api.identities}`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  hello(): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(
      `${this.apiUrl}/${env.api.hello}`,
      this.getDeviceInfo()
    );
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.accessToken && !!this.tokenService.refreshToken;
  }

  login(data: ILogin): Observable<IHttpResponse<ILogin>> {
    return this.http.post<IHttpResponse<ILogin>>(
      `${this.apiUrl}/${env.api.authenticate}`,
      data
    );
  }

  getLogin(): Observable<IHttpResponse<ILogin>> {
    return this.http.post<IHttpResponse<ILogin>>(
      `${this.apiUrl}/${env.api.login}`,
      {}
    );
  }

  // changePassword(data: any): Observable<IHttpResponse<any>> {
  //   return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.changePassword}`, data);
  // }

  logout(): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(
      `${this.apiUrl}/${env.api.logout}`,
      {}
    );
  }

  refresh(): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(
      `${this.apiUrl}/${env.api.refresh}`,
      this.tokenService.getTokens()
    );
  }

  // setPassword(data: any): Observable<IHttpResponse<any>> {
  //   return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.setPassword}`, data);
  // }
  //
  // setToken(fcmToken: string): Observable<string> {
  //   return this.http.post<string>(`${this.apiUrl}/${env.api.setToken}`, {fcmToken});
  // }
  //
  // requestLoginCode(data: any, token?: string): Observable<IHttpResponse<IResetInterface>> {
  //   let headers = new HttpHeaders();
  //
  //   if (token) {
  //     headers = headers.set('Authorization', `Bearer ${token}`);
  //   }
  //
  //   return this.http.post<IHttpResponse<IResetInterface>>(
  //     `${this.apiUrl}/${env.api.restoreAccess}`,
  //     data,
  //     { headers }
  //   );
  // }
  //
  // verifyCodeAndLogin(data: any): Observable<IHttpResponse<any>> {
  //   return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.confirmRestoreAccess}`, data);
  // }
  //
  // setResendVerificationCode(formData: any): Observable<IHttpResponse<any>> {
  //   return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.resendRestoreAccessCode}`, formData);
  // }

  getDeviceId(): string {
    let id: string;
    let key = localStorage.getItem(DEVICE_ID);
    if (key && key !== 'undefined') {
      return key;
    } else {
      id = uuidv4();
      localStorage.setItem(DEVICE_ID, id);
    }
    return id;
  }

  getDeviceInfo(): any {
    return {
      device: {
        codeUid: this.getDeviceId(),
        name: navigator.userAgent,
        appVersion: env.appVersion,
        appMenuVersion: '1',
        model: navigator.platform,
        os: getOSName(),
        platform: '913c5a08-bb9e-497c-b02b-09b8391c6913',
        type: 'browser',
        isRooted: false,
      },
    };
  }
}
