import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {IHistoryUsers} from "@modules/user/users-history/interfaces/users-history.interface";

@Injectable()
export class UsersHistoryService {

  private apiUrl = `${env.apiUrl}/${env.api.posTerminalUserAuditTables}`;
  private http = inject(HttpClient);

  getHistory(queryParams: Params): Observable<IHttpResponse<IHistoryUsers[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IHistoryUsers[]>>(this.apiUrl, {params});
  }

  getHistoryDetail(id: string): Observable<IHttpResponse<IHistoryUsers>> {
    return this.http.get<IHttpResponse<IHistoryUsers>>(`${this.apiUrl}/${id}`);
  }

}
