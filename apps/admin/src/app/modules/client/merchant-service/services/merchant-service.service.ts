import {HttpClient, HttpParams} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from '@angular/router';
import {IMerchantService} from "@modules/client/merchant-service/interfaces/merchant-service.interface";

@Injectable()
export class MerchantServiceService {

  private apiUrl = `${env.apiUrl}/${env.api.merchant_service}`;
  private readonly http = inject(HttpClient)

  getMerchantService(queryParams: Params, merchantId: string): Observable<IHttpResponse<IMerchantService[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMerchantService[]>>(`${this.apiUrl}/${merchantId}`, {params});
  }

  getMerchantServiceUpdate(merchantId: string, posTypeId: string): Observable<IHttpResponse<IMerchantService>> {
    return this.http.get<IHttpResponse<IMerchantService>>(`${this.apiUrl}/update/${merchantId}/${posTypeId}`);
  }

  getMerchantServiceDetail(merchantId: string, posTypeId: string): Observable<IHttpResponse<IMerchantService[]>> {
    return this.http.get<IHttpResponse<IMerchantService[]>>(`${this.apiUrl}/detail/${merchantId}/${posTypeId}`);
  }

  updateService(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createService(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  remove(merchantId: string, posTypeId: string): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.remove}`, {merchantId, posTypeId});
  }
}
