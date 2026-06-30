import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { environment as env } from "@environments/environment";
import { Params } from "@angular/router";
import { IHistoryOrders } from "@modules/food/orders/history/interfaces/history.interface";
import { IOrder } from '@modules/food/orders/active-orders/interfaces/order.interface';

@Injectable()
export class historyOrdersService {

  private apiUrl = `${env.apiFoodUrl}/${env.api.orders}`;
  private http = inject(HttpClient);

  getHistoryOrders(queryParams: Params): Observable<IHttpResponse<IHistoryOrders[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IHistoryOrders[]>>(`${this.apiUrl}`, {params});
  }

  getHistoryById(id: string): Observable<IHttpResponse<IOrder>> {
    return this.http.get<IHttpResponse<IOrder>>(`${this.apiUrl}/${id}`);
  }
}
