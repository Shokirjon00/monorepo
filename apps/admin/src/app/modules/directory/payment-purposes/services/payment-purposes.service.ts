import { HttpClient, HttpParams } from '@angular/common/http';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment as env } from 'environments/environment';
import { IAreaDetail } from '@modules/directory/area/interfaces/area-detail.interface';
import { Params } from '@angular/router';
import { IPaymentPurpose } from "@modules/directory/payment-purposes/interfaces/payment-purposes.interface";
import { IPaymentPurposesDetail } from "@modules/directory/payment-purposes/interfaces/payment-purposes-detail.interface";

@Injectable()
export class PaymentPurposesService {

  private apiUrl = `${env.apiUrl}/${env.api.paymentPurposes}`;
  private readonly http = inject(HttpClient);

  getPaymentPurposes(queryParams: Params): Observable<IHttpResponse<IPaymentPurpose[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPaymentPurpose[]>>(this.apiUrl, {params});
  }

  getAreaDetail(id: string): Observable<IHttpResponse<IPaymentPurposesDetail>> {
    return this.http.get<IHttpResponse<IPaymentPurposesDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IAreaDetail): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.post<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IAreaDetail): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.post<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
