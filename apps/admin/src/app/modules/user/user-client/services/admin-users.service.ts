import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IUsers} from '@modules/user/user-client/interfaces/users.interface';

@Injectable()
export class AdminUsersService {

  private apiUrl = `${env.apiUrl}/${env.api.adminUsers}`;
  private http = inject(HttpClient);


  getAdminUserById(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.resetPassword}`, id);
  }

  sendFirstLoginData(id: any): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.sendFirstLoginData}`, id);
  }
}
