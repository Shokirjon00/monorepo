import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@environments/environment';
import { IOrder } from '@modules/order/interfaces/order';
import { IOrderDetailHistory } from '@modules/order/interfaces/order-detail-history';

@Injectable()
export class OrderService {
  private apiUrl = `${env.apiUrl}`;
  private http = inject(HttpClient);

  getOrders(queryParams: Params): Observable<IHttpResponse<IOrder[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IOrder[]>>(`${this.apiUrl}/${env.api.orders}`, { params });
  }

  getOrderHistories(queryParams: Params, orderId: string): Observable<IHttpResponse<IOrderDetailHistory>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IOrderDetailHistory>>(`${this.apiUrl}/${env.api.orders}/ ${orderId}`, {params});
  }
}
