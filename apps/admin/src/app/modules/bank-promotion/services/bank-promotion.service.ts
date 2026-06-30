import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IBankPromotion } from '@modules/bank-promotion/interfaces/bank-promotion.interface';
import { ISelect } from '@core/interfaces/select.interface';
import { Params } from '@angular/router';

@Injectable()
export class BankPromotionService {

  private apiUrl = `${env.apiUrl}/${env.api.cashbackPromotion}`;
  private http = inject(HttpClient);

  getBankPromotions(queryParams: Params): Observable<IHttpResponse<IBankPromotion[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBankPromotion[]>>(this.apiUrl, {params});
  }

  getIBankPromotionById(id: string): Observable<IHttpResponse<IBankPromotion>> {
    return this.http.get<IHttpResponse<IBankPromotion>>(`${this.apiUrl}/${id}`);
  }

  getBankPromotionTypes(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.types}/${env.api.dictionary}`);
  }

  getIBankPromotionDetail(id: string): Observable<IHttpResponse<IBankPromotion>> {
    return this.http.get<IHttpResponse<IBankPromotion>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateIBankPromotion(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createIBankPromotion(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IBankPromotion>> {
    return this.http.post<IHttpResponse<IBankPromotion>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }
}
