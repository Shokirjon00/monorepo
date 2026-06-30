import {HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ICashbackAccrualType} from '@modules/bank-promotion/interfaces/cashback-accrual-types.interfaces';

@Injectable()
export class CashbackAccrualTypesServices {

  private apiUrl = `${env.apiUrl}/${env.api.cashbackAccrualTypes}`;
  private http = inject(HttpClient);

  getCashbackAccrualTypes(): Observable<IHttpResponse<ICashbackAccrualType[]>> {
    return this.http.get<IHttpResponse<ICashbackAccrualType[]>>(`${this.apiUrl}`);
  }

  getCashbackAccrualDictionary(): Observable<IHttpResponse<ICashbackAccrualType[]>> {
    return this.http.get<IHttpResponse<ICashbackAccrualType[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getICashbackAccrualTypeDetail(id: string): Observable<IHttpResponse<ICashbackAccrualType>> {
    return this.http.get<IHttpResponse<ICashbackAccrualType>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateICashbackAccrualType(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createICashbackAccrualType(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<ICashbackAccrualType>> {
    return this.http.post<IHttpResponse<ICashbackAccrualType>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }
}
