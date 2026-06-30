import { inject, Injectable } from '@angular/core';
import { environment as env } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IWithdrawalAmount } from '@modules/withdrawal-amount/withdrawal-amount-info/interfaces/withdrawal-amount.interface';
import { Params } from '@angular/router';
import { IAccountDetail } from '@modules/client/company/interfaces/account-detail.interface';

@Injectable()
export class WithdrawalAmountService {
  private apiUrl = `${env.apiUrl}/${env.api.issueMoneyRegistries}`;
  private http = inject(HttpClient);

  getWithdrawalAmounts(queryParams: Params): Observable<IHttpResponse<IWithdrawalAmount[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IWithdrawalAmount[]>>(this.apiUrl, {params});
  }

  allCompanyIssueMoneyRegistries(): Observable<IHttpResponse<IAccountDetail>> {
    return this.http.post<IHttpResponse<IAccountDetail>>(`${this.apiUrl}/${env.api.allCompaniesIssueMoney}`, {});
  }

  manuallyIssueMoney(body: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.manuallyIssueMoney}`, body);
  }
}
