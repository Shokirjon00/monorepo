import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@core/interfaces/select.interface';
import { IAccount } from '@modules/merchant-container/account/interfaces/account.interface';
import { IAccountDetail } from '@modules/merchant-container/account/interfaces/account-detail.interface';
import { Params } from '@angular/router';

@Injectable()
export class AccountService {
  private apiUrl = `${env.apiUrl}/${env.api.accounts}`;
  private http = inject(HttpClient);


  getRequisites(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.requisites}`, { params });
  }

  // getRequisitesCards(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
  //   const params = new HttpParams({fromObject: queryParams});
  //   return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.requisites}/${env.api.cards}`,{params});
  // }

  getAccounts(queryParams: Params): Observable<IHttpResponse<IAccount[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IAccount[]>>(this.apiUrl, { params });
  }

  getAccountDetail(id: string): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.get<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getRequisitesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.requisites}/${env.api.dictionary}`);
  }

  createAccount(data: IAccountDetail): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.post<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  updateAccount(data: IAccountDetail): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.post<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${env.api.delete}/${id}`, {});
  }
}
