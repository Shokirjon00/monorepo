import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import {
  ICommissionCompany, ICommissionCompanyEdit
} from "@modules/client/company/company-detail/commission-company/interfaces/commission-company.interface";
import { ISelect } from "@core/interfaces";

@Injectable()
export class CommissionCompanyService {
  private readonly apiUrl = `${env.apiUrl}/${env.api.commissionCompanies}`;
  private readonly commissionTypeApiUrl = `${env.apiUrl}/${env.api.commissionTypes}`;
  private readonly http = inject(HttpClient);

  getCommissionList(queryParams: Params): Observable<IHttpResponse<ICommissionCompany[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICommissionCompany[]>>(this.apiUrl, {params});
  }

  getCommissionCompanyDetail(id: string): Observable<IHttpResponse<ICommissionCompanyEdit>> {
    return this.http.get<IHttpResponse<ICommissionCompanyEdit>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCommission(data: ICommissionCompanyEdit): Observable<IHttpResponse<ICommissionCompanyEdit>> {
    return this.http.post<IHttpResponse<ICommissionCompanyEdit>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCommission(data: ICommissionCompanyEdit): Observable<IHttpResponse<ICommissionCompanyEdit>> {
    return this.http.post<IHttpResponse<ICommissionCompanyEdit>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getCommissionTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.commissionTypeApiUrl}/${env.api.dictionary}`);
  }

  getCommissionCompanyById(id: string): Observable<IHttpResponse<ICommissionCompany>> {
    return this.http.get<IHttpResponse<ICommissionCompany>>(`${this.apiUrl}/${id}`);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<ICommissionCompany>> {
    return this.http.post<IHttpResponse<ICommissionCompany>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }
}
