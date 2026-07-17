import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { ISMS } from "@modules/sms-notification/promotion-system/interface/sms.interface";

@Injectable()
export class SmsService {
  private apiUrl = `${env.apiUrl}/${env.api.notificationSettings}`;
  private http = inject(HttpClient);

  getSystemNotification(queryParams: Params): Observable<IHttpResponse<ISMS[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISMS[]>>(`${this.apiUrl}/${env.api.systemNotifications}`, {params});
  }

  getSmsNotificationDetail(id: string): Observable<IHttpResponse<ISMS>> {
    return this.http.get<IHttpResponse<ISMS>>(`${this.apiUrl}/${id}`);
  }

  updateSmsNotification(data: ISMS): Observable<IHttpResponse<ISMS>> {
    return this.http.post<IHttpResponse<ISMS>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getUpdateSmsNotification(id: string): Observable<IHttpResponse<ISMS>> {
    return this.http.get<IHttpResponse<ISMS>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  createSmsNotification(data: ISMS): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
