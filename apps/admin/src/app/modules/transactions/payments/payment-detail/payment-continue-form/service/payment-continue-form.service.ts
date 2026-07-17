import { inject, Injectable } from '@angular/core';
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IParam, ISelect } from "@core/interfaces";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@environments/environment";
import { IPaymentDetail, IPaymentHistory } from "@modules/transactions/payments/interfaces";

@Injectable()
export class PaymentContinueFormService {
  paymentUpdate: any;
  private readonly apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private readonly http = inject(HttpClient);

  getPaymentStatus(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.paymentContinueRules}/${env.api.paymentStatus}/${env.api.dictionary}`, {params});
  }

  updatePayment(form: IParam): Observable<IHttpResponse<IPaymentDetail[]>> {
    return this.http.post<IHttpResponse<IPaymentDetail[]>>(`${this.apiUrl}/${env.api.update}`, form);
  }
  getPaymentForEdit(id: string): Observable<IHttpResponse<IPaymentDetail>> {
    return this.http.get<IHttpResponse<IPaymentDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getPaymentContinue(paymentId: string): Observable<IHttpResponse<IPaymentHistory[]>> {
    return this.http.post<IHttpResponse<IPaymentHistory[]>>(`${this.apiUrl}/${env.api.continue}`, {paymentId});
  }
}
