import { inject, Injectable } from "@angular/core";
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentStatusDetail } from "@modules/directory/payment-status/interfaces/payment-status-detail.interfaces";
import { IPaymentStatus } from "@modules/directory/payment-status/interfaces/payment-status.interfaces";

@Injectable()
export class PaymentStatusDetailService {

  private apiUrl = `${env.apiUrl}/${env.api.paymentStatusDetail}`;
  private http = inject(HttpClient);

  getPaymentStatus(queryParams: Params): Observable<IHttpResponse<IPaymentStatus[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentStatus[]>>(this.apiUrl, {params});
  }

  getPaymentStatusDetailById(id: string): Observable<IHttpResponse<IPaymentStatusDetail>> {
    return this.http.get<IHttpResponse<IPaymentStatusDetail>>(`${this.apiUrl}/${id}`)
  }

  PaymentStatusDetail(id: string): Observable<IHttpResponse<IPaymentStatusDetail>> {
    return this.http.get<IHttpResponse<IPaymentStatusDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updatePaymentStatusDetail(data: any): Observable<IHttpResponse<IPaymentStatusDetail>> {
    return this.http.post<IHttpResponse<IPaymentStatusDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createPaymentStatusDetail(data: any): Observable<IHttpResponse<IPaymentStatusDetail>> {
    return this.http.post<IHttpResponse<IPaymentStatusDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
