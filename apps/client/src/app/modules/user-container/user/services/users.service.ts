import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ISelect } from "@core/interfaces/select.interface";
import { Params } from "@angular/router";
import { IUserInfo, IUserProfile } from "@core/interfaces/user.interface";
import { IUsers } from "@modules/user-container/user/interfaces/users.interface";

@Injectable({providedIn: 'root'})
export class UsersService {

  private apiUrl = `${env.apiUrl}/${env.api.users}`;
  private apiUrlAvatar = `${env.apiUrl}/${env.api.users}`;
  private http = inject(HttpClient)

  getUserInfo(): Observable<IHttpResponse<IUserInfo>> {
    return this.http.get<IHttpResponse<IUserInfo>>(`${env.apiUrl}/${env.api.users}/${env.api.info}`);
  }

  getUserProfile(): Observable<IHttpResponse<IUserProfile>> {
    return this.http.get<IHttpResponse<IUserProfile>>(`${env.apiUrl}/${env.api.users}/${env.api.profile}`);
  }

  getUsers(queryParams: Params): Observable<IHttpResponse<IUsers[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUsers[]>>(this.apiUrl, {params});
  }

  getUserById(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${id}`);
  }

  getUserDetail(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getUserUpdateDetail(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }


  updateUser(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createUser(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  changeActiveStatus(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }

  getRolesDictionary(params: any): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(
      `${env.apiUrl}/${env.api.userRoles}/${env.api.dictionary}`,
      { params }
    );
  }

  updateAvatar(photo: FormData): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrlAvatar}/${env.api.uploadAvatar}`, photo);
  }

  changePassword(data: Params): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${env.apiUrl}/${env.api.users}/${env.api.changePassword}`, data);
  }

  resetPassword(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.resetPassword}`, id);
  }

  sendFirstLoginData(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.sendFirstLoginData}`, id);
  }
}
