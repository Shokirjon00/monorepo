import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {IUserLog} from '@core/interfaces/user-log.interface';

@Injectable()
export class UserClientLogService {

  private apiUrl = `${env.apiUrl}/${env.api.clientUserActivities}`;
  private readonly http = inject(HttpClient);

  getAdminUsersActivities(queryParams: Params): Observable<IHttpResponse<IUserLog[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUserLog[]>>(this.apiUrl, {params});
  }

}
