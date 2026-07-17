import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentHistory } from "@modules/transactions/payments/interfaces";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class PaymentHistoryService {
  private readonly http = inject(HttpClient);

  getPaymentHistories(id: string): Observable<IHttpResponse<IPaymentHistory[]>> {
    return this.http.get<IHttpResponse<IPaymentHistory[]>>(`${env.apiUrl}/${env.api.paymentHistories}/${id}`);
  }
}
