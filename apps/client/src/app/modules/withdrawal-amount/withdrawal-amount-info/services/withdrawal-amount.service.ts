import { inject, Injectable } from '@angular/core';
import { environment as env } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IWithdrawalAmount } from '@modules/withdrawal-amount/withdrawal-amount-info/interfaces/withdrawal-amount.interface';
import { Params } from '@angular/router';

@Injectable()
export class WithdrawalAmountService {
  private readonly http = inject(HttpClient);
  private apiUrl = `${env.apiUrl}/${env.api.issueMoneyRegistries}`;

  getWithdrawalAmounts(queryParams: Params): Observable<IHttpResponse<IWithdrawalAmount[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IWithdrawalAmount[]>>(this.apiUrl, { params });
  }

  getWithdrawalAmountsMerchants(queryParams: Params): Observable<IHttpResponse<IWithdrawalAmount[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IWithdrawalAmount[]>>(`${this.apiUrl}/${env.api.merchants}`, { params });
  }

  withdrawalAmountNow(body: { merchantsId: string[] }): Observable<IHttpResponse<IWithdrawalAmount[]>> {
    return this.http.post<IHttpResponse<IWithdrawalAmount[]>>(`${this.apiUrl}/${env.api.issueMoneyManual}`, body);
  }

  check(): Observable<IHttpResponse<boolean>> {
    return this.http.get<IHttpResponse<boolean>>(`${this.apiUrl}/${env.api.check}`, {});
  }
}
