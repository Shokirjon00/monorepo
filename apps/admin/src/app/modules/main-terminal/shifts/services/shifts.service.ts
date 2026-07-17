import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { IShift } from "@modules/main-terminal/shifts/interfaces/shifts.interface";
import { ITransaction } from "@modules/transactions/payments/interfaces";

@Injectable()
export class ShiftsService {
  private apiUrl = `${env.apiUrl}/${env.api.shift}`;
  private readonly http = inject(HttpClient);

  getShift(queryParams: Params): Observable<IHttpResponse<IShift[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IShift[]>>(this.apiUrl, {params});
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IShift>> {
    return this.http.post<IHttpResponse<IShift>>(`${this.apiUrl}/${env.api.close}`, {id});
  }

  getCheck(id: string, receiptTypeId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${env.api.receipt}`, {
      observe: 'response',
      responseType: 'blob',
      params: { id, receiptTypeId }
    });
  }

  getReceiptType(): Observable<IHttpResponse<IShift[]>> {
    return this.http.get<IHttpResponse<IShift[]>>(`${this.apiUrl}/${env.api.receipt_type_dictionary}`, {});
  }

  getShiftDetail(iftLogId: string, queryParams: any): Observable<IHttpResponse<ITransaction>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<ITransaction>>(`${this.apiUrl}/${iftLogId}`, {params});
  }

}
