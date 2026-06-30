import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from 'environments/environment';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { IService } from "@modules/service/interfaces/service.interface";
import { IServiceDetail } from "@modules/service/interfaces/service-detail.interface";
import { IMerchantDetail } from "@modules/client/merchant/interfaces/merchant-detail.interface";

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = `${env.apiUrl}/${env.api.services}`;
  private readonly http = inject(HttpClient);

  getServices(queryParams: Params): Observable<IHttpResponse<IService[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IService[]>>(this.apiUrl, {params});
  }

  getDetail(id: string): Observable<IHttpResponse<IServiceDetail>> {
    return this.http.get<IHttpResponse<IServiceDetail>>(`${this.apiUrl}/${id}`);
  }

  getServicesDetail(data: IMerchantDetail): Observable<IHttpResponse<IServiceDetail>> {
    return this.http.post<IHttpResponse<IServiceDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getServicesUpdateDetail(id: string): Observable<IHttpResponse<IServiceDetail>> {
    return this.http.get<IHttpResponse<IServiceDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  create(data: IServiceDetail): Observable<IHttpResponse<IServiceDetail>> {
    return this.http.post<IHttpResponse<IServiceDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  uploadLogo(photo: FormData): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.uploadIcon}`, photo);
  }
}
