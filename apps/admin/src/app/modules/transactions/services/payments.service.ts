import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { tap } from "rxjs/operators";
import { HeaderService } from "@core/services/header.service";
import {
  IPaymentContinue,
  IPaymentDetail,
  IPaymentRefundForm,
  ITransaction
} from "@modules/transactions/payments/interfaces";

import { environment as env } from '@environments/environment'
import { PaymentsServiceBase } from "@modules/transactions/abstract/payment-service";

@Injectable()
export class PaymentsService extends PaymentsServiceBase<any> {

  private readonly apiUrl = `${env.apiUrl}/${env.api.payments}`;
  private readonly http = inject(HttpClient);
  private readonly headerService = inject(HeaderService);

  getPayments(queryParams: Params): Observable<IHttpResponse<ITransaction>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<ITransaction>>(this.apiUrl, { params })
      .pipe(
        tap(res => {
          if (res.status) {
            this.headerService.setPayments(res.data?.paymentStatusAmounts);
          }
        })
      );
  }

  getDetail(id: string): Observable<IHttpResponse<IPaymentDetail>> {
    return this.http.get<IHttpResponse<IPaymentDetail>>(`${this.apiUrl}/${id}`);
  }

  getPaymentContinueProcess(paymentId: string): Observable<IHttpResponse<IPaymentContinue>> {
    return this.http.post<IHttpResponse<IPaymentContinue>>(`${this.apiUrl}/${env.api.continueProcess}`, { paymentId });
  }

  getPaymentForEdit(id: string): Observable<IHttpResponse<IPaymentDetail>> {
    return this.http.get<IHttpResponse<IPaymentDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  syncStatus(ids: string[]): Observable<IHttpResponse<IPaymentContinue>> {
    return this.http.post<IHttpResponse<IPaymentContinue>>(`${this.apiUrl}/${env.api.syncStatus}`, { paymentsId: ids });
  }

  paymentCancel(form: IPaymentRefundForm): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.post<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.cancel}`, form);
  }

  checkPaymentRefund(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.get<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.check}/${paymentId}`);
  }

  checkPaymentStatusIft(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.get<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.getStatus}/${paymentId}`);
  }

  checkPaymentStatusJetQr(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>> {
    return this.http.get<IHttpResponse<IPaymentRefundForm>>(`${this.apiUrl}/${env.api.getStatusJetqr}/${paymentId}`);
  }

}
