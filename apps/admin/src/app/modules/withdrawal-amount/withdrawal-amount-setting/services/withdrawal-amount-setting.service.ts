import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {
  IWithdrawSet
} from '@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting.interface';
import {
  IWithdrawalAmountSettingDetail
} from '@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting-detail.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {Params} from '@angular/router';

@Injectable()
export class WithdrawSetService {
  private apiUrl = `${env.apiUrl}/${env.api.issueMoneySettings}`;
  private http = inject(HttpClient);

  getWithdrawalAmountSettings(queryParams: Params): Observable<IHttpResponse<IWithdrawSet[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IWithdrawSet[]>>(this.apiUrl, {params});
  }

  getDetail(id: string): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>> {
    return this.http.get<IHttpResponse<IWithdrawalAmountSettingDetail>>(`${this.apiUrl}/${id}`);
  }

  getPeriodTypes(): Observable<IHttpResponse<ISelect[]>>{
    return this.http.get<IHttpResponse<ISelect[]>>(env.apiUrl + '/' + env.api.issueMoneyPeriodTypes)
  }

  getForUpdate(id: string): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>>{
    return this.http.get<IHttpResponse<IWithdrawalAmountSettingDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IWithdrawalAmountSettingDetail): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>> {
    return this.http.post<IHttpResponse<IWithdrawalAmountSettingDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IWithdrawalAmountSettingDetail): Observable<IHttpResponse<IWithdrawalAmountSettingDetail>> {
    return this.http.post<IHttpResponse<IWithdrawalAmountSettingDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
