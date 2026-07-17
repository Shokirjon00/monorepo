import {HttpClient, HttpParams} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {Params} from '@angular/router';
import {IMailing, IMailingUpdate} from '@modules/mailing/interfaces/mailing.interface';

@Injectable()
export class MailingService {

  private apiUrl = `${env.apiUrl}/${env.api.mailings}`;
  private http = inject(HttpClient);

  getMailing(queryParams: Params): Observable<IHttpResponse<IMailing[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMailing[]>>(this.apiUrl, {params});
  }

  getMailingDetailById(id: string): Observable<IHttpResponse<IMailing>> {
    return this.http.get<IHttpResponse<IMailing>>(`${this.apiUrl}/${id}`);
  }
  getActionTypes(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.mailingActionTypes}/${env.api.dictionary}`);
  }
  getPeriodTypes(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.mailingPeriodTypes}/${env.api.dictionary}`);
  }

  getMailingDetail(id: string): Observable<IHttpResponse<IMailingUpdate>> {
    return this.http.get<IHttpResponse<IMailingUpdate>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateMailing(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createMailing(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
