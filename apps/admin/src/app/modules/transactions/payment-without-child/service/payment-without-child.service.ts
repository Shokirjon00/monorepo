import { inject, Injectable } from '@angular/core';
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentChild } from "@modules/transactions/payments/interfaces";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@environments/environment";

@Injectable()
export class PaymentWithoutChildService {
  private readonly apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private readonly http = inject(HttpClient);

  getPaymentsItems(queryParams: Params): Observable<IHttpResponse<IPaymentChild[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentChild[]>>(`${this.apiUrl}/${env.api.all}`, {params});
  }
}
