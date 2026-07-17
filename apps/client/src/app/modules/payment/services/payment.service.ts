import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentDetail } from "../interfaces/payment-detail.interface";
import { environment as env } from "environments/environment";
import { IPaymentHistory } from "@modules/payment/interfaces/payment-history.interface";
import { ISelect } from "@core/interfaces/select.interface";
import { IPayments } from "@modules/payment/interfaces/payment.interface";
import { Params } from "@angular/router";
import { IPaymentRefundForm } from '@modules/payment/interfaces/payment-refund-form.interface';

@Injectable()
export class PaymentService {

  private apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private http = inject(HttpClient);


  getPayments(queryParams: Params): Observable<IHttpResponse<IPayments>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPayments>>(this.apiUrl, {params});
  }

  getDetail(id: string): Observable<IHttpResponse<IPaymentDetail>> {
    return this.http.get<IHttpResponse<IPaymentDetail>>(`${this.apiUrl}/${id}`);
  }

  getPaymentHistories(id: string): Observable<IHttpResponse<IPaymentHistory[]>> {
    return this.http.get<IHttpResponse<IPaymentHistory[]>>(`${env.apiUrl}/${env.api.paymentHistories}/${id}`);
  }

  paymentCansel(form: IPaymentRefundForm): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.post<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.cancel}`, form);
  }

  getPaymentRefundReasons(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.paymentRefundReasons}/${env.api.dictionary}`,);
  }

  getCheck(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${paymentId}/${env.api.receipt}`, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  checkPaymentRefund(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.get<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.check}/${paymentId}`);
  }
}
