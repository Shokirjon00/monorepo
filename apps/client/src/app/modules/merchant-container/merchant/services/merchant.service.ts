import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IMerchantDetail } from '../interfaces/merchant-detail.interface';
import { environment as env } from '@environments/environment';
import { IMerchant } from '@modules/merchant-container/merchant/interfaces/merchant.interface';
import { IMerchantForm } from '@modules/merchant-container/merchant/interfaces/merchant-form.interface';
import { ISelect } from '@eskhata/util';
import { Params } from '@angular/router';

@Injectable()
export class MerchantService {
  private apiUrl = `${env.apiUrl}/${env.api.merchants}`;
  private apiUrlApplications = `${env.apiUrl}/${env.api.merchantApplications}`;
  private http = inject(HttpClient);

  getMerchants(queryParams: Params): Observable<IHttpResponse<IMerchant[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IMerchant[]>>(`${this.apiUrl}`, { params });
  }

  getMerchantsWithoutPagination(queryParams: Params): Observable<IHttpResponse<IMerchant[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IMerchant[]>>(`${this.apiUrl}/${env.api.dictionaryWithoutPagination}`, {
      params,
    });
  }

  getDetail(id: string): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.get<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${id}`);
  }

  getMerchantUpdateDetail(id: string): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.get<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getIntegrationsDictionary(id: string): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.integrationType}/${id}`);
  }

  getMerchantsDictionary(params: Params): Observable<IHttpResponse<ISelect[]>> {
    return this.http.post<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, { ...params });
  }

  createMerchant(data: IMerchantDetail): Observable<IHttpResponse<IMerchantForm>> {
    return this.http.post<IHttpResponse<IMerchantForm>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  createMerchantApplications(data: IMerchantDetail): Observable<IHttpResponse<IMerchantForm>> {
    return this.http.post<IHttpResponse<IMerchantForm>>(`${this.apiUrlApplications}/${env.api.create}`, data);
  }

  updateMerchant(data: IMerchantDetail): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.post<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }
}
