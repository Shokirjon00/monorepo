import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IWithdrawalAmountSettingDetail } from "@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting-detail.interface";
import { ISelect } from "@core/interfaces/select.interface";

@Injectable()
export class WithdrawSetService {
  private apiUrl = `${env.apiUrl}/${env.api.issueMoneySettings}`;
  private http = inject(HttpClient);

  getWithdrawalAmountSettings(): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>> {
    return this.http.get<IHttpResponse<IWithdrawalAmountSettingDetail>>(this.apiUrl);
  }

  getPeriodTypes(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(env.apiUrl + '/' + env.api.issueMoneyPeriodTypes)
  }

  create(data: IWithdrawalAmountSettingDetail): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>> {
    return this.http.post<IHttpResponse<IWithdrawalAmountSettingDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }
}
