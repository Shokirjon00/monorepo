import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {
  IMerchantApplicationStatus
} from "@modules/directory/application-status/interfaces/application-status.interface";
import {IMerchantApplicationDetail} from "@modules/directory/application-status/interfaces/city-detail.interface";

@Injectable({
  providedIn: 'root'
})
export class ApplicationStatusService {

  private apiUrl = `${env.apiUrl}/${env.api.merchantApplicationStatuses}`;
  private http = inject(HttpClient);

  getMerchantApplicationStatus(queryParams: Params): Observable<IHttpResponse<IMerchantApplicationStatus[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMerchantApplicationStatus[]>>(this.apiUrl, {params});
  }

  getMerchantApplicationStatusById(id: string): Observable<IHttpResponse<IMerchantApplicationDetail>> {
    return this.http.get<IHttpResponse<IMerchantApplicationDetail>>(`${this.apiUrl}/${id}`);
  }

  getMerchantApplicationStatusDetail(id: string): Observable<IHttpResponse<IMerchantApplicationDetail>> {
    return this.http.get<IHttpResponse<IMerchantApplicationDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateMerchantApplicationStatus(data: IMerchantApplicationDetail): Observable<IHttpResponse<IMerchantApplicationDetail>> {
    return this.http.post<IHttpResponse<IMerchantApplicationDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createMerchantApplicationStatus(data: IMerchantApplicationDetail): Observable<IHttpResponse<IMerchantApplicationDetail>> {
    return this.http.post<IHttpResponse<IMerchantApplicationDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
