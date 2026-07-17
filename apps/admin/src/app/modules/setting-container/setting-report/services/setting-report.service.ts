import {inject, Injectable} from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from '@angular/router';
import {ISetting} from '@modules/setting-container/setting/interfaces/setting.interface';
import {ISettingReport} from '@modules/setting-container/setting-report/interfaces/setting-report.interface';
import {IExportQueueData} from "@modules/report/export-queue/interfaces/export-queue-data";

@Injectable()
export class SettingReportService {
  private apiUrl = `${env.apiUrl}/${env.api.client_reports}`;
  private apiUrlStamp = `${env.apiUrl}/${env.api.reportStamps}`;

  private http = inject(HttpClient);

  getSettingReports(queryParams: Params): Observable<IHttpResponse<ISettingReport[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISettingReport[]>>(this.apiUrl, {params});
  }

  getSettingUpdate(id: string): Observable<IHttpResponse<ISetting>> {
    return this.http.get<IHttpResponse<ISetting>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }
  getSettingDetail(settingId: string): Observable<IHttpResponse<ISetting>> {
    return this.http.get<IHttpResponse<ISetting>>(`${this.apiUrl}/${settingId}`);
  }

  updateSetting(data: ISetting): Observable<IHttpResponse<ISetting>> {
    return this.http.post<IHttpResponse<ISetting>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getStamp(queryParams: any): Observable<IHttpResponse<IExportQueueData>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IExportQueueData>>(this.apiUrlStamp, {params});
  }

  uploadStapm(photo: FormData): Observable<IHttpResponse<ISetting>> {
    return this.http.post<IHttpResponse<ISetting>>(`${this.apiUrlStamp}/${env.api.set}`, photo);
  }

  uploadStapmTitle(photo: FormData): Observable<IHttpResponse<ISetting>> {
    return this.http.post<IHttpResponse<ISetting>>(`${this.apiUrlStamp}/${env.api.setTitle}`, photo);
  }

}
