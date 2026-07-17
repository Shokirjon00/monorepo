import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {IHistory} from "@modules/user/client-history/interfaces/client-history.interface";

@Injectable()
export class ClientHistoryService {

  private apiUrl = `${env.apiUrl}/${env.api.adminUserAuditTables}`;
  private readonly http = inject(HttpClient);

  getHistory(queryParams: Params): Observable<IHttpResponse<IHistory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IHistory[]>>(this.apiUrl, {params});
  }

  getHistoryDetail(id: string): Observable<IHttpResponse<IHistory>> {
    return this.http.get<IHttpResponse<IHistory>>(`${this.apiUrl}/${id}`);
  }

}
