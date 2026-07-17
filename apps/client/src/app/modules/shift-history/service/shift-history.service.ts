import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams, HttpResponse } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IShiftHistory } from "@modules/shift-history/interfaces/shift-history";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPayments } from "@modules/payment/interfaces/payment.interface";

@Injectable()
export class ShiftHistoryService {
  private readonly http = inject(HttpClient);
  private apiUrl = `${env.apiUrl}/${env.api.shift}`;


  getShift(queryParams: Params): Observable<IHttpResponse<IShiftHistory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IShiftHistory[]>>(this.apiUrl, {params});
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IShiftHistory>> {
    return this.http.post<IHttpResponse<IShiftHistory>>(`${this.apiUrl}/${env.api.close}`, {id});
  }

  getCheck(id: string, receiptTypeId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${env.api.receipt}`, {
      observe: 'response',
      responseType: 'blob',
      params: { id, receiptTypeId }
    });
  }

  getReceiptType(): Observable<IHttpResponse<IShiftHistory[]>> {
    return this.http.get<IHttpResponse<IShiftHistory[]>>(`${this.apiUrl}/${env.api.receipt_type_dictionary}`, {})
  }

  getShiftDetail(iftLogId: string, queryParams: Params): Observable<IHttpResponse<IPayments>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IPayments>>(`${this.apiUrl}/${iftLogId}`, {params});
  }
}
