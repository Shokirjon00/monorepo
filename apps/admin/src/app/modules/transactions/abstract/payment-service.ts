import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { IPaymentContinue, IPaymentDetail, IPaymentRefundForm } from "@modules/transactions/payments/interfaces";

export abstract class PaymentsServiceBase<T> {
  paymentUpdate: any;

  /**
   * Метод для получения всех транзакций
   * @param queryParams Параметры фильтрации
   */
  public abstract getPayments(queryParams: Params): Observable<IHttpResponse<T>>;

  /**
   * Метод для получения всех транзакций
   * @param id Параметры фильтрации
   */
  public abstract getDetail(id: string): Observable<IHttpResponse<IPaymentDetail>>

  /**
   * Метод для продолжения процесса платежа
   * @param paymentId Идентификатор платежа
   */
  public abstract getPaymentContinueProcess(paymentId: string): Observable<IHttpResponse<IPaymentContinue>>;

  /**
   * Метод для редактирования платежа по ID
   * @param id Идентификатор платежа
   */
  public abstract getPaymentForEdit(id: string): Observable<IHttpResponse<IPaymentDetail>>;

  /**
   * Метод для синхронизации статуса платежа
   * @param ids Массив идентификаторов платежей
   */
  public abstract syncStatus(ids: string[]): Observable<IHttpResponse<IPaymentContinue>>;

  /**
   * Метод для проверки возврата платежа
   * @param paymentId Идентификатор платежа
   */
  public abstract checkPaymentRefund(paymentId: string): Observable<IHttpResponse<IPaymentRefundForm>>;
}
