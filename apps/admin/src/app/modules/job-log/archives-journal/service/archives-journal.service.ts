import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {IJobLog, IJobLogInfo} from "@modules/job-log/interfaces/job-log.interface";

@Injectable()
export class ArchivesJournalService {
  private apiUrl = `${env.apiUrl}/${env.api.jobLogsDWH}`;
  private http = inject(HttpClient);

  getJobLogsDWH(queryParams: Params): Observable<IHttpResponse<IJobLog[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IJobLog[]>>(`${this.apiUrl}`, {params});
  }

  getDetail(jobLogId: string, queryParams: Params = {}): Observable<IHttpResponse<IJobLogInfo>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IJobLogInfo>>(`${this.apiUrl}/${jobLogId}`, { params });
  }
}
