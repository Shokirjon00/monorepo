import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@environments/environment';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IUserInfo, IUserProfile } from '@core/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${env.apiUrl}/${env.api.users}`;
  private _http = inject(HttpClient);

  getUserInfo(): Observable<IHttpResponse<IUserInfo>> {
    return this._http.get<IHttpResponse<IUserInfo>>(`${this.apiUrl}/${env.api.info}`);
  }

  getUserProfile(): Observable<IHttpResponse<IUserProfile>> {
    return this._http.get<IHttpResponse<IUserProfile>>(`${this.apiUrl}/${env.api.profile}`);
  }

  changePassword(data: any): Observable<IHttpResponse<any>> {
    return this._http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.changePassword}`, data);
  }

  updateAvatar(photo: FormData): Observable<IHttpResponse<any>> {
    return this._http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.uploadAvatar}`, photo);
  }
}
