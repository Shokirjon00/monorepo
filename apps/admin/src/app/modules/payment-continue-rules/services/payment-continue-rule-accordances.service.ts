import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Params} from '@angular/router';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {
  IPaymentContinueRuleAccordanceDetail
} from '@modules/payment-continue-rules/interfaces/payment-continue-rule-accordance-detail.interface';
import {
  IPaymentContinueRuleAccordance
} from '@modules/payment-continue-rules/interfaces/payment-continue-rule-accordance.interface';

@Injectable()
export class PaymentContinueRuleAccordancesService{
  private apiUrl = `${env.apiUrl}/${env.api.paymentContinueRuleAccordances}`;
  private readonly http = inject(HttpClient);

  getAccordances(queryParams: Params): Observable<IHttpResponse<IPaymentContinueRuleAccordance[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentContinueRuleAccordance[]>>(this.apiUrl,{params});
  }

  getAccordanceDetail(id: string): Observable<IHttpResponse<IPaymentContinueRuleAccordanceDetail>> {
    return this.http.get<IHttpResponse<IPaymentContinueRuleAccordanceDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IPaymentContinueRuleAccordanceDetail): Observable<IHttpResponse<IPaymentContinueRuleAccordanceDetail>> {
    return this.http.post<IHttpResponse<IPaymentContinueRuleAccordanceDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IPaymentContinueRuleAccordanceDetail): Observable<IHttpResponse<IPaymentContinueRuleAccordanceDetail>> {
    return this.http.post<IHttpResponse<IPaymentContinueRuleAccordanceDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
