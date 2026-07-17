import { inject, Injectable } from '@angular/core';
import { environment as env } from "environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { Params } from "@angular/router";
import { IAdvancePaymentDetails } from "@modules/advance-payments/interface/advance-payments-detail";
import { IBanner } from "@shared/components/banner/interface/banner";
import { IAdvancePayments } from "@modules/advance-payments/interface/advance-payments.interface";

@Injectable()
export class AdvancePaymentsService {
  private readonly http = inject(HttpClient);
  private apiUrl = `${env.apiUrl}/${env.api.advancePayouts}`;
  private apiUrlOffer = `${env.apiUrl}/${env.api.advancePayoutOffers}`;

  getAdvancePayments(queryParams: Params): Observable<IHttpResponse<IAdvancePayments[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAdvancePayments[]>>(this.apiUrl, {params});
  }

  getCondition(): Observable<IHttpResponse<IAdvancePayments>> {
    return this.http.get<IHttpResponse<IAdvancePayments>>(`${this.apiUrl}`);
  }

  getAmounts(): Observable<IHttpResponse<IBanner>> {
    return this.http.get<IHttpResponse<IBanner>>(`${this.apiUrlOffer}`);
  }

  getAdvanceById(id: string,queryParams: Params): Observable<IHttpResponse<IAdvancePaymentDetails[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAdvancePaymentDetails[]>>(`${this.apiUrl}/${id}`,{params});
  }
}
