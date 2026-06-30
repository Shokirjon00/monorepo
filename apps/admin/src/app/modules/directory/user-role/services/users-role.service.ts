import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import { inject, Injectable } from '@angular/core';
import {Params} from '@angular/router';
import {IUserRole} from "@modules/directory/user-role/interfaces/user-role.interface";

@Injectable({
  providedIn: 'root'
})
export class UsersRoleService {
  private apiUrl = `${env.apiUrl}/${env.api.posTerminalUserRoles}`;
  private http = inject(HttpClient);

  getClientRoles(queryParams: Params): Observable<IHttpResponse<IUserRole[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUserRole[]>>(this.apiUrl, {params});
  }

  getClientRoleById(id: string): Observable<IHttpResponse<IUserRole>> {
    return this.http.get<IHttpResponse<IUserRole>>(`${this.apiUrl}/${id}`);
  }

  getClientRoleDetail(id: string): Observable<IHttpResponse<IUserRole>> {
    return this.http.get<IHttpResponse<IUserRole>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getClientRolePermissionDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.permissionDictionary}`);
  }

  updateClientRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createClientRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
