import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ICashback } from "@modules/merchant-container/cashback/interfaces/cashback.interface";
import { Params } from "@angular/router";

@Injectable()
export class CashbackService {
  private readonly apiUrl = `${env.apiUrl}/${env.api.cashbackCompanies}`;
  private http = inject(HttpClient);


  getCashbackCompanies(queryParams: Params): Observable<IHttpResponse<ICashback[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICashback[]>>(this.apiUrl, {params});
  }

  getCashbackCompanyById(id: string): Observable<IHttpResponse<ICashback>> {
    return this.http.get<IHttpResponse<ICashback>>(`${this.apiUrl}/${id}`);
  }

}
