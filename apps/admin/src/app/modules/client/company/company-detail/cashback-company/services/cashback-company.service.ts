import {HttpClient, HttpParams} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {
  ICashbackCompany
} from '@modules/client/company/company-detail/cashback-company/interfaces/cashback-company.interface';
import {Params} from '@angular/router';

@Injectable()
export class CashbackCompanyService {

  private apiUrl = `${env.apiUrl}/${env.api.cashbackCompanies}`;
  private http =inject(HttpClient);

  getCashbackCompanies(queryParams: Params): Observable<IHttpResponse<ICashbackCompany[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICashbackCompany[]>>(this.apiUrl, {params});
  }

  getCashbackCompanyById(id: string): Observable<IHttpResponse<ICashbackCompany>> {
    return this.http.get<IHttpResponse<ICashbackCompany>>(`${this.apiUrl}/${id}`);
  }

  getCashbackCompanyDetail(id: string): Observable<IHttpResponse<ICashbackCompany>> {
    return this.http.get<IHttpResponse<ICashbackCompany>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCashback(data: ICashbackCompany): Observable<IHttpResponse<ICashbackCompany>> {
    return this.http.post<IHttpResponse<ICashbackCompany>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCashback(data: ICashbackCompany): Observable<IHttpResponse<ICashbackCompany>> {
    return this.http.post<IHttpResponse<ICashbackCompany>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
