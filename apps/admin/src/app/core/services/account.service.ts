import {inject, Injectable} from '@angular/core';
import {environment as env} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {IAccount} from '@modules/client/company/interfaces/account.interface';
import {IAccountDetail} from '@modules/client/company/interfaces/account-detail.interface';
import {Params} from '@angular/router';
import {IAccountHistory} from '@modules/client/company/interfaces/account-history.interface';

@Injectable()
export class AccountService {
  private apiUrl = `${env.apiUrl}/${env.api.accounts}`;
  private apiHistoryUrl = `${env.apiUrl}/${env.api.accountHistories}`;
  private http = inject(HttpClient);

  getRequisites(companyId: string, queryParams?: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(
      `${this.apiUrl}/${env.api.requisites}/${env.api.dictionary}/${companyId}`, { params }
    );
  }

  getChecked(accountId: string): Observable<IHttpResponse<ISelect[]>> {
    return this.http.post<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.check_bank}`, {accountId});
  }

  getHistory(queryParams: Params, id: string): Observable<IHttpResponse<IAccountHistory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAccountHistory[]>>(`${this.apiHistoryUrl}/${id}`,{params});
  }

  getRequisitesCards(companyId: string): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.cards}/${env.api.requisites}/${env.api.dictionary}/${companyId}`);
  }

  getAccounts(companyId: string,queryParams: Params): Observable<IHttpResponse<IAccount[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAccount[]>>(`${this.apiUrl}/${env.api.requisites}/${companyId}`,{params});
  }
  getSystemAccounts( companyId: string,queryParams: Params): Observable<IHttpResponse<IAccount[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAccount[]>>(`${this.apiUrl}/${env.api.system}/${env.api.requisites}/${companyId}`,{params});
  }

  getAccountDetail(id: string): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.get<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.accountTypes}/${env.api.dictionary}`);
  }

  createAccount(data: IAccountDetail): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.post<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  updateAccount(data: IAccountDetail): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.post<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getDemands(companyId: string): Observable<IHttpResponse<IAccount[]>> {
    return this.http.get<IHttpResponse<IAccount[]>>(`${this.apiUrl}/${env.api.demands}/${env.api.dictionary}/${companyId}`);
  }

  getSettlements(companyId: string): Observable<IHttpResponse<IAccount[]>> {
    return this.http.get<IHttpResponse<IAccount[]>>(`${this.apiUrl}/${env.api.advanceSettlements}/${env.api.dictionary}/${companyId}`);
  }
}
