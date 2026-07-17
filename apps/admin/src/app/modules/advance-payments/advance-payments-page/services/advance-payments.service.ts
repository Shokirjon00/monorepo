import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@environments/environment";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IAdvance } from "@modules/advance-payments/advance-payments-page/interfaces/advance-payments-page";

@Injectable({
  providedIn: 'root'
})
export class AdvancePaymentsService {
  private apiUrl = `${env.apiUrl}/${env.api.advancePayouts}`;
  private http = inject(HttpClient);

  getAdvance(queryParams: Params): Observable<IHttpResponse<IAdvance>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAdvance>>(this.apiUrl, {params});
  }
}
