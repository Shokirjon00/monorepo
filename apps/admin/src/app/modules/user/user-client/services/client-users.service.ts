import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IUsers} from '@modules/user/user-client/interfaces/users.interface';
import {ISelect} from '@eskhata/util';
import {Params} from '@angular/router';

@Injectable()
export class ClientUsersService {

  private apiUrl = `${env.apiUrl}/${env.api.clientUsers}`;
  private http = inject(HttpClient);

  getClientUsers(queryParams: Params): Observable<IHttpResponse<IUsers[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUsers[]>>(this.apiUrl, {params});
  }

  getClientUserById(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${id}`);
  }

  getClientUserDetail(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateClientUser(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createClientUser(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getClientRolesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.clientUserRoles}/${env.api.dictionary}`);
  }

  resetPassword(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.resetPassword}`, id);
  }

  sendFirstLoginData(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.sendFirstLoginData}`, id);
  }
}
