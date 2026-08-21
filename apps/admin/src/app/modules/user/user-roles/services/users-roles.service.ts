import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from "@angular/router";
import {ISelect} from '@eskhata/util';
import {IUsersRoles} from "@modules/user/user-roles/interfaces/users-roles.interface";

@Injectable()
export class UsersRolesService {

  private apiUrl = `${env.apiUrl}/${env.api.posTerminalUsers}`;
  private http = inject(HttpClient);


  getUsersRoles(queryParams: Params): Observable<IHttpResponse<IUsersRoles[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUsersRoles[]>>(this.apiUrl, {params});
  }

  getClientUserById(id: string): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.get<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${id}`);
  }

  getClientUserDetail(id: string): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.get<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateClientUser(data: IUsersRoles): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.post<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createClientUser(data: IUsersRoles): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.post<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getClientRolesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.posTerminalUserRoles}/${env.api.dictionary}`);
  }

  resetPassword(id: any): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.post<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${env.api.resetPassword}`, id);
  }

  sendFirstLoginData(id: any): Observable<IHttpResponse<IUsersRoles>> {
    return this.http.post<IHttpResponse<IUsersRoles>>(`${this.apiUrl}/${env.api.sendFirstLoginData}`, id);
  }
}
