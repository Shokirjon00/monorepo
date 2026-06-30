import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from 'environments/environment';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IBalanceLimit } from '@modules/balance-limit/Interfaces/balance-limit.interface';
import { Params } from '@angular/router';
import { IBalanceLimitIFT } from '@modules/balance-limit/Interfaces/balance-limit-ift.interface';
import { IParam } from '@core/interfaces/param.interface';
import { IBalanceLimitIftHistory } from '@modules/balance-limit/Interfaces/balance-limit-ift-history';

@Injectable()
export class BalanceLimitService {
  private apiUrl = `${env.apiUrl}/${env.api.limitBalance}`;
  private http = inject(HttpClient);

  getBalanceLimits(queryParams: Params): Observable<IHttpResponse<IBalanceLimit[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBalanceLimit[]>>(this.apiUrl, {params});
  }

  getBalanceLimitDetail(id: string): Observable<IHttpResponse<IBalanceLimit>> {
    return this.http.get<IHttpResponse<IBalanceLimit>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateBalanceLimit(data: IBalanceLimit): Observable<IHttpResponse<IBalanceLimit>> {
    return this.http.post<IHttpResponse<IBalanceLimit>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createBalanceLimit(data: IBalanceLimit): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getIftLimit(): Observable<IHttpResponse<IBalanceLimitIFT>> {
    return this.http.get<IHttpResponse<IBalanceLimitIFT>>(`${env.apiUrl}/${env.api.iftlimits}`);
  }

  updateIftLimit(body: IParam): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${env.apiUrl}/${env.api.iftlimits}/update`, body);
  }

  refreshIftLimit(queryParams: Params): Observable<IHttpResponse<any>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<any>>(`${env.apiUrl}/${env.api.iftlimits}/update`, {params});
  }

  getIftHistory(queryParams: Params): Observable<IHttpResponse<IBalanceLimitIftHistory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBalanceLimitIftHistory[]>>(`${env.apiUrl}/${env.api.iftlimits}/history`, {params});
  }
}
