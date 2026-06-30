import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IAggregate} from '@modules/analytics/interfaces/aggregate.interface';
import {IPaymentStatistics} from '@modules/analytics/interfaces/payment-statistics.interface';
import {IAveragePayment, IPaymentCount, IPaymentPosType, IPaymentStatus} from '@modules/analytics/interfaces/analytic.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {Params} from '@angular/router';

@Injectable()
export class AnalyticService {
  private apiUrl = `${env.apiUrl}/${env.api.analytics}`;
  private http = inject(HttpClient);

  getAggregationData(queryParams: Params): Observable<IHttpResponse<IAggregate>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAggregate>>(`${this.apiUrl}/${env.api.aggregationData}`, {params});
  }

  getPaymentStatistics(queryParams: Params): Observable<IHttpResponse<IPaymentStatistics>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentStatistics>>(`${this.apiUrl}/${env.api.paymentsDurationStatistics}`, {params});
  }

  getPaymentCount(
    tab: 'all' | 'incoming' | 'outgoing',
    queryParams: Params
  ): Observable<IHttpResponse<IPaymentCount>> {
    const endpointsMap = {
      all: env.api.paymentsByCount,
      incoming: env.api.paymentsByCountInflow,
      outgoing: env.api.paymentsByCountOutflow,
    };

    const url = `${this.apiUrl}/${endpointsMap[tab] || env.api.paymentsByCount}`;

    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IPaymentCount>>(url, { params });
  }

  getPaymentAmount(
    tab: 'all' | 'incoming' | 'outgoing',
    queryParams: Params
  ): Observable<IHttpResponse<IPaymentCount>> {
    const endpointsMap = {
      all: env.api.paymentsByAmount,
      incoming: env.api.paymentsByAmountInflow,
      outgoing: env.api.paymentsByAmountOutflow,
    };

    const url = `${this.apiUrl}/${endpointsMap[tab] || env.api.paymentsByAmount}`;

    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IPaymentCount>>(url, { params });
  }


  getPaymentStatus(queryParams: Params): Observable<IHttpResponse<IPaymentStatus[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentStatus[]>>(`${this.apiUrl}/${env.api.paymentsByStatus}`, {params});
  }

  getPaymentPosType(queryParams: Params): Observable<IHttpResponse<IPaymentPosType>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentPosType>>(`${this.apiUrl}/${env.api.paymentsByPosType}`, {params});
  }

  getAveragePayment(queryParams: Params): Observable<IHttpResponse<IAveragePayment>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAveragePayment>>(`${this.apiUrl}/${env.api.averagePaymentsAmount}`, {params});
  }

  getFilterDate(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dateFilter}`);
  }
}
