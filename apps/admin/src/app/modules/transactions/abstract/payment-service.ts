import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { IPaymentContinue, IPaymentDetail, IPaymentRefundForm } from "@modules/transactions/payments/interfaces";

export abstract class PaymentsServiceBase<T> {
  paymentUpdate: any;

  public abstract getPayments(queryParams: Params): Observable<IHttpResponse<T>>;

  public abstract getDetail(id: string): Observable<IHttpResponse<IPaymentDetail>>

  public abstract getPaymentContinueProcess(paymentId: string): Observable<IHttpResponse<IPaymentContinue>>;

  public abstract getPaymentForEdit(id: string): Observable<IHttpResponse<IPaymentDetail>>;

  public abstract syncStatus(ids: string[]): Observable<IHttpResponse<IPaymentContinue>>;

  public abstract checkPaymentRefund(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>>;
}
