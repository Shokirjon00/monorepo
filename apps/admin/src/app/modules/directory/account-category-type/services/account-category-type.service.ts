import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Params} from '@angular/router';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {
  IAccountCategoryType
} from '@modules/directory/account-category-type/interfaces/account-category-type.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountCategoryTypeService{
  private apiUrl = `${env.apiUrl}/${env.api.accountCategoryTypes}`;
  private readonly http = inject(HttpClient);

  getAccountCategoryTypes(queryParams: Params): Observable<IHttpResponse<IAccountCategoryType[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAccountCategoryType[]>>(this.apiUrl, {params});
  }

  getAccountCategoryTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getAccountCategoryTypeById(id: string): Observable<IHttpResponse<IAccountCategoryType>> {
    return this.http.get<IHttpResponse<IAccountCategoryType>>(`${this.apiUrl}/${id}`);
  }

  getAccountCategoryTypeDetail(id: string): Observable<IHttpResponse<IAccountCategoryType>> {
    return this.http.get<IHttpResponse<IAccountCategoryType>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IAccountCategoryType): Observable<IHttpResponse<IAccountCategoryType>> {
    return this.http.post<IHttpResponse<IAccountCategoryType>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IAccountCategoryType): Observable<IHttpResponse<IAccountCategoryType>> {
    return this.http.post<IHttpResponse<IAccountCategoryType>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
