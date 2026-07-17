import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Params} from '@angular/router';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {
  IPaymentContinueRulesDetail
} from '@modules/payment-continue-rules/interfaces/payment-continue-rules-detail.interface';
import {IPaymentContinueRules} from '@modules/payment-continue-rules/interfaces/payment-continue-rules.interface';

@Injectable()
export class PaymentContinueRulesService {

  private apiUrl = `${env.apiUrl}/${env.api.paymentContinueRules}`;
  private http = inject(HttpClient);

  getPaymentContinueRules(queryParams: Params): Observable<IHttpResponse<IPaymentContinueRules[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentContinueRules[]>>(this.apiUrl, {params});
  }

  getPaymentContinueRuleById(id: string): Observable<IHttpResponse<IPaymentContinueRules>> {
    return this.http.get<IHttpResponse<IPaymentContinueRules>>(`${this.apiUrl}/${id}`);
  }

  getPaymentContinueRuleDetail(id: string): Observable<IHttpResponse<IPaymentContinueRulesDetail>> {
    return this.http.get<IHttpResponse<IPaymentContinueRulesDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IPaymentContinueRulesDetail): Observable<IHttpResponse<IPaymentContinueRulesDetail>> {
    return this.http.post<IHttpResponse<IPaymentContinueRulesDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IPaymentContinueRulesDetail): Observable<IHttpResponse<IPaymentContinueRulesDetail>> {
    return this.http.post<IHttpResponse<IPaymentContinueRulesDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
