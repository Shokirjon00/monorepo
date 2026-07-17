import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {ICurrency} from "@modules/directory/currency/interfaces/currency.interfaces";
import {ICurrencyDetail} from "@modules/directory/currency/interfaces/currency-detail.interfaces";


@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private apiUrl = `${env.apiUrl}/${env.api.currencies}`;
  private readonly http = inject(HttpClient);

  getCurrency(queryParams: Params): Observable<IHttpResponse<ICurrency[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICurrency[]>>(this.apiUrl, {params});
  }

  getCurrencyDetail(id: string): Observable<IHttpResponse<ICurrencyDetail>> {
    return this.http.get<IHttpResponse<ICurrencyDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCurrency(data: ICurrencyDetail): Observable<IHttpResponse<ICurrencyDetail>> {
    return this.http.post<IHttpResponse<ICurrencyDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCurrency(data: ICurrencyDetail): Observable<IHttpResponse<ICurrencyDetail>> {
    return this.http.post<IHttpResponse<ICurrencyDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
