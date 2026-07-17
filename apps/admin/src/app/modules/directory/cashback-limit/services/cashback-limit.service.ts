import { inject, Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ICashbackLimit} from '@modules/directory/cashback-limit/interfaces/cashback-limit.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {ICashbackLimitDetail} from '@modules/directory/cashback-limit/interfaces/cashback-limit-detail.interface';
import {Params} from '@angular/router';

@Injectable({
    providedIn: 'root'
  })
export class CashbackLimitService {

  private apiUrl = `${env.apiUrl}/${env.api.cashbacLimit}`;
  private readonly http = inject(HttpClient);

  getCashbackLimits(queryParams: Params): Observable<IHttpResponse<ICashbackLimit[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICashbackLimit[]>>(this.apiUrl, {params});
  }

  getCashbackLimitById(id: string): Observable<IHttpResponse<ICashbackLimit>>{
    return this.http.get<IHttpResponse<ICashbackLimit>>(`${this.apiUrl}/${id}`)
  }

  getCashbackLimitDetail(id: string): Observable<IHttpResponse<ICashbackLimitDetail>>{
    return this.http.get<IHttpResponse<ICashbackLimitDetail>>(`${this.apiUrl}/${env.api.update}/${id}`)
  }

  getCashbackLimitDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getCashbackLimitTypesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.types}/${env.api.dictionary}`);
  }

  updateCashbackLimit(data: ICashbackLimitDetail): Observable<IHttpResponse<ICashbackLimitDetail>> {
    return this.http.post<IHttpResponse<ICashbackLimitDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCashbackLimit(data: ICashbackLimitDetail): Observable<IHttpResponse<ICashbackLimitDetail>> {
    return this.http.post<IHttpResponse<ICashbackLimitDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
