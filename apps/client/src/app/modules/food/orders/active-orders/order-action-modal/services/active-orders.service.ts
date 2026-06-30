import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {environment as env} from "@environments/environment";
import { IOrder, OrderAction } from "@modules/food/orders/active-orders/interfaces/order.interface";
import { Params } from '@angular/router';
import { IOrders } from '@modules/food/orders/active-orders/interfaces/active-orders.interface';

@Injectable()
export class OrdersDetailService {

  private foodUrl = `${env.apiFoodUrl}/${env.api.orders}`;
  private http = inject(HttpClient);

  getActiveOrdersDetail(id: string): Observable<IHttpResponse<IOrder>> {
    return this.http.get<IHttpResponse<IOrder>>(`${this.foodUrl}/${id}`);
  }

  performOrderAction(
    orderId: string,
    action: OrderAction,
    payload?: { reasonId?: string; productVariantIds?: string[] }
  ) {
    const body = {
      merchantUserFullName: sessionStorage.getItem('userFullName') ?? 'Unknown',
      ...(action === 'cancel' && {
        orderRefusalReasonId: payload?.reasonId,
        productVariantIds: payload?.productVariantIds
      })
    };

    return this.http.post(`${this.foodUrl}/${orderId}/${action}`, body);
  }

  getOrderRefusal(): Observable<IHttpResponse<any[]>> {
    return this.http.get<IHttpResponse<any[]>>(`${env.apiFoodUrl}/order-refusal-reasons`);
  }

}
