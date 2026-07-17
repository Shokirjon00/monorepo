import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentDetail } from "@modules/transactions/payments/interfaces";
import { HttpClient } from "@angular/common/http";
import { environment as env } from "@environments/environment";

@Injectable()
export class PaymentInfoService {

  private readonly apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private readonly http = inject(HttpClient);

  getDetail(id: string): Observable<IHttpResponse<IPaymentDetail>> {
    return this.http.get<IHttpResponse<IPaymentDetail>>(`${this.apiUrl}/${id}`);
  }

  unlockPayment(paymentId: string): Observable<IHttpResponse<object>> {
    return this.http.post<IHttpResponse<object>>(`${this.apiUrl}/${env.api.unlock}`, {id: paymentId});
  }
}
