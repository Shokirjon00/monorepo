import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from '@angular/router';
import {IIftLog} from '@modules/ift-log/interfaces/ift-log.interface';

@Injectable()
export class IftLogService {
  private apiUrl = `${env.apiUrl}/${env.api.iftLog}`;
  private readonly http = inject(HttpClient);

  getIftLogs(queryParams: Params): Observable<IHttpResponse<IIftLog[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IIftLog[]>>(`${this.apiUrl}`, {params});
  }

  getIftLogDetail(iftLogId: string): Observable<IHttpResponse<IIftLog>> {
    return this.http.get<IHttpResponse<IIftLog>>(`${this.apiUrl}/${iftLogId}`);
  }

}
