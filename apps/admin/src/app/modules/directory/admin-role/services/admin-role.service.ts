import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { inject, Injectable } from '@angular/core';
import { IAdminRole, IPermissions } from '@modules/directory/admin-role/interfaces/admin-role.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminRoleService {
  private apiUrl = `${env.apiUrl}/${env.api.adminUserRoles}`;
  private http = inject(HttpClient);

  getAdminRoles(queryParams: Params): Observable<IHttpResponse<IAdminRole[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAdminRole[]>>(this.apiUrl, {params});
  }

  getAdminRoleById(id: string): Observable<IHttpResponse<IAdminRole>> {
    return this.http.get<IHttpResponse<IAdminRole>>(`${this.apiUrl}/${id}`);
  }

  getAdminRoleDetail(id: string): Observable<IHttpResponse<IAdminRole>> {
    return this.http.get<IHttpResponse<IAdminRole>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getAdminRolePermissionDictionary(): Observable<IHttpResponse<IPermissions[]>> {
    return this.http.get<IHttpResponse<IPermissions[]>>(`${this.apiUrl}/${env.api.permissionDictionary}`);
  }

  updateAdminRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createAdminRole(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
