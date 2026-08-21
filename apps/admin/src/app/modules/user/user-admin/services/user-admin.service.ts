import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@environments/environment';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Observable } from 'rxjs';
import { IUserAdmin } from '@modules/user/user-admin/interfaces/user-admin.interface';
import { ISelect } from '@eskhata/util';
import { Params } from '@angular/router';

@Injectable()
export class UserAdminService {

  private apiUrl = `${env.apiUrl}/${env.api.adminUser}`;
  private readonly http = inject(HttpClient);

  getAdminUsers(queryParams: Params): Observable<IHttpResponse<IUserAdmin[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUserAdmin[]>>(this.apiUrl, {params});
  }

  getAdminUserDetail(id: string): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.get<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateAdminUser(data: IUserAdmin): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.post<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createAdminUser(data: IUserAdmin): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.post<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.post<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }

  getAdminRolesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.adminUserRoles}/${env.api.dictionary}`);
  }

  getReceiptType(params: { page?: number; pageSize?: number } = {}): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(
      `${this.apiUrl}/${env.api.dictionary}`,
      { params }
    );
  }

}
