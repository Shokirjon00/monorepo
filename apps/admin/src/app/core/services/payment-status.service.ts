import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';
import {environment as env} from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentStatusService {
  private apiUrl = `${env.apiUrl}/${env.api.paymentStatuses}`;
  private http = inject(HttpClient);

  getPaymentStatusDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {params});
  }
}
