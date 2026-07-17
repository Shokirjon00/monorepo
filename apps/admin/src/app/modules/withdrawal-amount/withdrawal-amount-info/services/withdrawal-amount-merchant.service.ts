import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {
  IWithdrawalAmountMerchants
} from '@modules/withdrawal-amount/withdrawal-amount-info/interfaces/withdrawal-amount-merchants.interface';
import {Params} from '@angular/router';

@Injectable()
export class WithdrawalAmountMerchantService {
  private apiUrl = `${env.apiUrl}/${env.api.issueMoneyRegistryMerchants}`;
  private http = inject(HttpClient);

  getWithdrawalAmountMerchants(id: string, queryParams: Params): Observable<IHttpResponse<IWithdrawalAmountMerchants[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IWithdrawalAmountMerchants[]>>(`${this.apiUrl}/${id}` , {params});
  }
}
