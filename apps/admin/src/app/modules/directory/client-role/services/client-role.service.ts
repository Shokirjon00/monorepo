import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import { inject, Injectable } from '@angular/core';
import {IClientRole} from '@modules/directory/client-role/interfaces/client-role.interface';
import {Params} from '@angular/router';
import { IPermissions } from "@modules/directory/admin-role/interfaces/admin-role.interface";

@Injectable({
  providedIn: 'root'
})
export class ClientRoleService {
  private apiUrl = `${env.apiUrl}/${env.api.clientUserRoles}`;
  private readonly http = inject(HttpClient);

  getClientRoles(queryParams: Params): Observable<IHttpResponse<IClientRole[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IClientRole[]>>(this.apiUrl, {params});
  }

  getClientRoleById(id: string): Observable<IHttpResponse<IClientRole>> {
    return this.http.get<IHttpResponse<IClientRole>>(`${this.apiUrl}/${id}`);
  }

  getClientRoleDetail(id: string): Observable<IHttpResponse<IClientRole>> {
    return this.http.get<IHttpResponse<IClientRole>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getClientRolePermissionDictionary(): Observable<IHttpResponse<IPermissions[]>> {
    return this.http.get<IHttpResponse<IPermissions[]>>(`${this.apiUrl}/${env.api.permissionDictionary}`);
  }

  updateClientRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createClientRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
