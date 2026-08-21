import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DateRange } from '@eskhata/util';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IRevenueStatsData, IClientsData, IRevenues } from '@modules/food/analytics-food/interface/analytics.interface';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private foodUrl = `${env.apiFoodUrl}/${env.api.statistics}`;

  private getData<T>(endpoint: string, merchantIds: string[], dateRange: DateRange): Observable<IHttpResponse<T>> {
    let params = new HttpParams().set('DateRange', dateRange);
    merchantIds.forEach(id => (params = params.append('RestaurantPointIds', id)));
    return this.http.get<IHttpResponse<T>>(`${this.foodUrl}/${endpoint}`, { params });
  }

  getCommon(
    merchantIds: string[],
    dateRange: DateRange = DateRange.TODAY
  ): Observable<IHttpResponse<IRevenueStatsData>> {
    return this.getData<IRevenueStatsData>(env.api.common, merchantIds, dateRange);
  }

  getRevenues(merchantIds: string[], dateRange: DateRange = DateRange.TODAY): Observable<IHttpResponse<IRevenues>> {
    return this.getData<IRevenues>(env.api.revenues, merchantIds, dateRange);
  }

  getClients(merchantIds: string[], dateRange: DateRange = DateRange.TODAY): Observable<IHttpResponse<IClientsData>> {
    return this.getData<IClientsData>(env.api.clients, merchantIds, dateRange);
  }
}
