import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {environment as env} from "@environments/environment";
import {Params} from "@angular/router";
import { IOrders } from "@modules/food/orders/active-orders/interfaces/active-orders.interface";

@Injectable()
export class OrdersService {

  private foodUrl = `${env.apiFoodUrl}/${env.api.orders}`;
  private http = inject(HttpClient);

  getActiveOrders(queryParams: Params): Observable<IHttpResponse<IOrders[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IOrders[]>>(`${this.foodUrl}`, {params});
  }

}
