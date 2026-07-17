import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IAllowList } from "@modules/advance-payments/allow-list/interfaces/allow-list";
import { IAllowListDetail } from "@modules/advance-payments/allow-list/interfaces/allow-list-detail";

@Injectable({
  providedIn: 'root'
})
export class AllowListService {

  private apiUrl = `${env.apiUrl}/${env.api.advancePayoutOffers}`;

  private http = inject(HttpClient);

  getAdvancePayouts(queryParams: Params): Observable<IHttpResponse<IAllowList[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAllowList[]>>(this.apiUrl, {params});
  }

  getAdvancePayoutById(id: string): Observable<IHttpResponse<IAllowListDetail>> {
    return this.http.get<IHttpResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getUpdateDetail(id: string): Observable<IHttpResponse<IAllowListDetail>> {
    return this.http.get<IHttpResponse<IAllowListDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateAdvancePayout(data: IAllowListDetail): Observable<IHttpResponse<IAllowListDetail>> {
    return this.http.post<IHttpResponse<IAllowListDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createAdvancePayout(data: IAllowListDetail): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
