import {Injectable} from '@angular/core';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {ICategoryDetail} from '@modules/directory/category/interfaces/category-detail.interface';
import {Params} from '@angular/router';
import {
  IPaymentRefundReason
} from '@modules/directory/payment-refund-reason/interfaces/payment-refund-reason.interface';
import {
  IPaymentRefundReasonDetail
} from '@modules/directory/payment-refund-reason/interfaces/payment-refund-reason-detail.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentRefundReasonService {
  private apiUrl = `${env.apiUrl}/${env.api.paymentRefundReasons}`;

  constructor(private http: HttpClient) {
  }

  getPaymentRefundReasons(queryParams: Params): Observable<IHttpResponse<IPaymentRefundReason[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentRefundReason[]>>(this.apiUrl, {params});
  }

  getPaymentRefundReasonUpdate(id: string): Observable<IHttpResponse<IPaymentRefundReasonDetail>> {
    return this.http.get<IHttpResponse<IPaymentRefundReasonDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }
  getPaymentRefundReasonDetail(id: string): Observable<IHttpResponse<IPaymentRefundReasonDetail>> {
    return this.http.get<IHttpResponse<IPaymentRefundReasonDetail>>(`${this.apiUrl}/${id}`);
  }

  getPaymentRefundReasonsDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`,);
  }

  updateRefundReason(data: ICategoryDetail): Observable<IHttpResponse<IPaymentRefundReasonDetail>> {
    return this.http.post<IHttpResponse<IPaymentRefundReasonDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createRefundReason(data: ICategoryDetail): Observable<IHttpResponse<IPaymentRefundReasonDetail>> {
    return this.http.post<IHttpResponse<IPaymentRefundReasonDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
