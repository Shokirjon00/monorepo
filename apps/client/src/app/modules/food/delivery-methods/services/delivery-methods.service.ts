import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IDeliveryMethods } from "@modules/food/delivery-methods/interfaces/delivery-methods.interface";

@Injectable()
export class DeliveryMethodsService {
  private apiUrl = `${env.apiFoodUrl}/${env.api.restaurants}/${env.api.delivery_types}`
  private http = inject(HttpClient);

  getDelivery(): Observable<IHttpResponse<IDeliveryMethods[]>> {
    return this.http.get<IHttpResponse<IDeliveryMethods[]>>(`${this.apiUrl}`);
  }

  updateDelivery(
    data: { deliveryTypeId: string; priceAmount?: number }[]
  ): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/set`, data);
  }

}
