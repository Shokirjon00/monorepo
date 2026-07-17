import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from '@angular/router';
import { IJobLog, IJobLogData, IJobLogInfo } from "@modules/job-log/interfaces/job-log.interface";

@Injectable()
export class JobLogService {
  private apiUrl = `${env.apiUrl}/${env.api.jobLogs}`;
  private http = inject(HttpClient);

  check(jobLogId: string): Observable<IHttpResponse<IJobLogData>> {
    return this.http.get<IHttpResponse<IJobLogData>>(`${this.apiUrl}/${jobLogId}/${env.api.check}`);
  }

  getJobLogs(queryParams: Params): Observable<IHttpResponse<IJobLog[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IJobLog[]>>(`${this.apiUrl}`, {params});
  }

  getDetail(jobLogId: string, queryParams: Params = {}): Observable<IHttpResponse<IJobLogInfo>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IJobLogInfo>>(`${this.apiUrl}/${jobLogId}`, { params });
  }

}
