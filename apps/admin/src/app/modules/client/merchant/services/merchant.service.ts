import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IMerchantDetail} from '../interfaces/merchant-detail.interface';
import {environment as env} from '@environments/environment';
import {ISelect} from '@eskhata/util';
import {IMerchant} from '@modules/client/merchant/interfaces/merchant.interface';
import {Params} from '@angular/router';
import {IUserAdmin} from '@modules/user/user-admin/interfaces/user-admin.interface';

@Injectable()
export class MerchantService {
  private apiUrl = `${env.apiUrl}/${env.api.merchants}`;
  private http = inject(HttpClient);

  getMerchants(queryParams: Params): Observable<IHttpResponse<IMerchant[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMerchant[]>>(`${this.apiUrl}`, {params});
  }

  getMerchantsWithoutPagination(queryParams: Params): Observable<IHttpResponse<IMerchant[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMerchant[]>>(`${this.apiUrl}/${env.api.dictionaryWithoutPagination}`, {params});
  }

  getDetail(id: string): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.get<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${id}`);
  }

  getMerchantUpdateDetail(id: string): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.get<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  createMerchant(data: IMerchantDetail): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.post<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  updateMerchant(data: IMerchantDetail): Observable<IHttpResponse<IMerchantDetail>> {
    return this.http.post<IHttpResponse<IMerchantDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getMerchantsDictionary(params:Params): Observable<IHttpResponse<ISelect[]>> {
    return this.http.post<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {...params});
  }

  getIntegrationsDictionary(id: string): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.integrationType}/${id}`);
  }

  uploadLogo(photo: FormData): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.uploadLogo}`, photo);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.post<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }

  migrateForNewIssue(id: string): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.migrateForNewIssue}/${id}`, {});
  }

}
