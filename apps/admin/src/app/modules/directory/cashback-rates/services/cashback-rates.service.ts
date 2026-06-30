import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {ICashbackRates} from '@modules/directory/cashback-rates/interfaces/cashback-rates.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CashbackRatesService {
  private apiUrl = `${env.apiUrl}/${env.api.cashbacks}`;
  private readonly http = inject(HttpClient);

  getCashbackes(queryParams: Params): Observable<IHttpResponse<ICashbackRates[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICashbackRates[]>>(this.apiUrl, {params});
  }

  getCashbackById(id: string): Observable<IHttpResponse<ICashbackRates>> {
    return this.http.get<IHttpResponse<ICashbackRates>>(`${this.apiUrl}/${id}`);
  }

  getCashbackDetail(id: string): Observable<IHttpResponse<ICashbackRates>> {
    return this.http.get<IHttpResponse<ICashbackRates>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getCashbackDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  updateCashback(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCashback(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
