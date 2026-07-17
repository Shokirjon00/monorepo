import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IIncomeCode } from "@modules/directory/income-code/interfaces/income-code";
import { IncomeCodeDetail } from "@modules/directory/income-code/interfaces/income-code-detail";
import { ISelect } from "@core/interfaces";

@Injectable()
export class IncomeCode {
  private apiUrl = `${env.apiUrl}/${env.api.merchantGovernmentIncomes}`;
  private http = inject(HttpClient);

  getIncomeCode(queryParams: Params): Observable<IHttpResponse<IIncomeCode[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IIncomeCode[]>>(this.apiUrl, {params});
  }

  getIncomeCodeDetail(id: string): Observable<IHttpResponse<IncomeCodeDetail>> {
    return this.http.get<IHttpResponse<IncomeCodeDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateIncomeCode(data: any): Observable<IHttpResponse<IncomeCodeDetail>> {
    return this.http.post<IHttpResponse<IncomeCodeDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createIncomeCode(data: any): Observable<IHttpResponse<IncomeCodeDetail>> {
    return this.http.post<IHttpResponse<IncomeCodeDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getIncomeCodeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
