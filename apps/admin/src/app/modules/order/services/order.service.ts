import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@environments/environment';
import { IOrder } from '@modules/order/interfaces/order';
import { IOrderHistory } from '@modules/order/interfaces/order-history';
import { IOrderDetailHistory } from "@modules/order/interfaces/order-detail-history";

@Injectable()
export class OrderService {
  private apiUrl = `${env.apiUrl}`;
  private http = inject(HttpClient);

  getOrders(queryParams: Params): Observable<IHttpResponse<IOrder[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IOrder[]>>(`${this.apiUrl}/${env.api.orders}`, {params});
  }

  getOrderHistoryList(queryParams: Params, orderId: string): Observable<IHttpResponse<IOrderHistory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IOrderHistory[]>>(`${this.apiUrl}/${env.api.orderHistories}/${orderId}`, {params});
  }

  changeOrderStatus(body: {ids: string[], statusId: string}): Observable<IHttpResponse<{ids: string[], statusId: string}>> {
    return this.http.post<IHttpResponse<{ids: string[], statusId: string}>>(`${this.apiUrl}/${env.api.orders}/${env.api.changeStatus}`, body);
  }

  changeWebhook(body: { orderId: string }): Observable<IHttpResponse<{ orderId: string }>> {
    return this.http.post<IHttpResponse<{ orderId: string }>>(
      `${this.apiUrl}/${env.api.orders}/${env.api.sendWebhook}`,
      body
    );
  }

  getOrderHistories(queryParams: Params, orderId: string): Observable<IHttpResponse<IOrderDetailHistory>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IOrderDetailHistory>>(`${this.apiUrl}/${env.api.orders}/ ${orderId}`, {params});
  }
}
