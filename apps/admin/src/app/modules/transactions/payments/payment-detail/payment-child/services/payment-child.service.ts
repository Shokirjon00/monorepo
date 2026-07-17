import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentChild, IPaymentPaymentIssueMoney } from "@modules/transactions/payments/interfaces";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class PaymentChildService {

  private readonly apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private readonly http = inject(HttpClient);

  getPaymentChildren(id: string, queryParams: Params): Observable<IHttpResponse<IPaymentChild[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentChild[]>>(`${this.apiUrl}/${env.api.child}/${id}`, {params});
  }

  create(paymentId: string): Observable<IHttpResponse<IPaymentPaymentIssueMoney>> {
    return this.http.post<IHttpResponse<IPaymentPaymentIssueMoney>>(`${this.apiUrl}/${env.api.createPaymentIssueMoney}`, {paymentIds: [paymentId]});
  }
}
