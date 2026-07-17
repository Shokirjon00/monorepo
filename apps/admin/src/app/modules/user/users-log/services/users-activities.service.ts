import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {IUsersActivities} from "@modules/user/users-log/interfaces/users-log.interface";

@Injectable()
export class UsersActivitiesService {

  private apiUrl = `${env.apiUrl}/${env.api.posTerminalActivities}`;
  private http = inject(HttpClient);

  getUsersActivities(queryParams: Params): Observable<IHttpResponse<IUsersActivities[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUsersActivities[]>>(this.apiUrl, {params});
  }

  getActivitiesDetail(id: string): Observable<IHttpResponse<IUsersActivities>> {
    return this.http.get<IHttpResponse<IUsersActivities>>(`${this.apiUrl}/${id}`);
  }

}
