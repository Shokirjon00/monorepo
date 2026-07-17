import { inject, Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IUserInfo, IUserProfile} from '@core/interfaces/user.interface';
import {ISelect} from "@core/interfaces";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrlAvatar = `${env.apiUrl}/${env.api.adminUser}`;
  private _http = inject(HttpClient)

  getUserInfo(): Observable<IHttpResponse<IUserInfo>> {
    return this._http.get<IHttpResponse<IUserInfo>>(`${env.apiUrl}/${env.api.adminUsers}/${env.api.info}`);
  }

  getUserProfile(): Observable<IHttpResponse<IUserProfile>> {
    return this._http.get<IHttpResponse<IUserProfile>>(`${env.apiUrl}/${env.api.adminUsers}/${env.api.profile}`);
  }

  changePassword(data: any): Observable<IHttpResponse<any>> {
    return this._http.post<IHttpResponse<any>>(`${env.apiUrl}/${env.api.adminUsers}/${env.api.changePassword}`, data);
  }

  updateAvatar(photo: FormData): Observable<IHttpResponse<any>> {
    return this._http.post<IHttpResponse<any>>(`${this.apiUrlAvatar}/${env.api.uploadAvatar}`, photo);
  }

  getUsersDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this._http.get<IHttpResponse<ISelect[]>>(`${this.apiUrlAvatar}/${env.api.dictionary}`);
  }

}
