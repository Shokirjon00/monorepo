import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IPaymentRefundApplications } from '@core/interfaces/payments-refund-applications.interface';

@Injectable()
export class RefundPaymentApplicationService {
  private apiUrl = `${env.apiUrl}/${env.api.paymentsRefundApplications}`;
  private http = inject(HttpClient);

  getAll(queryParams: Params): Observable<IHttpResponse<IPaymentRefundApplications[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IPaymentRefundApplications[]>>(this.apiUrl, { params });
  }

  getDetail(id: string): Observable<IHttpResponse<IPaymentRefundApplications>> {
    return this.http.get<IHttpResponse<IPaymentRefundApplications>>(`${this.apiUrl}/${id}`);
  }

  confirm(data: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.confirm}`, data);
  }
}
