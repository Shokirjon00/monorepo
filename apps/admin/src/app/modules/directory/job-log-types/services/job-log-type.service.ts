import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IJobLogType } from "@modules/directory/job-log-types/interfaces/job-log-type";
import { IJobLogTypeDetail } from "@modules/directory/job-log-types/interfaces/job-log-type-detail";

@Injectable({
  providedIn: 'root'
})
export class TypeListService {

  private apiUrl = `${env.apiUrl}/job_log_types`;
  private readonly http = inject(HttpClient);

  getJobLogTypes(queryParams: Params): Observable<IHttpResponse<IJobLogType[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IJobLogType[]>>(this.apiUrl, {params});
  }

  getJobLogTypesDetail(id: string): Observable<IHttpResponse<IJobLogTypeDetail>> {
    return this.http.get<IHttpResponse<IJobLogTypeDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateJobLogTypesDetail(data: IJobLogTypeDetail): Observable<IHttpResponse<IJobLogTypeDetail>> {
    return this.http.post<IHttpResponse<IJobLogTypeDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }
}
