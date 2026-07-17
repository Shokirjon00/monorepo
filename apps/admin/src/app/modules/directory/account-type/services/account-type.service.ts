import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from '@environments/environment';
import { IAccountType } from '@modules/directory/account-type/interfaces/account-type.interface';
import { ISelect } from "@core/interfaces";

@Injectable({
  providedIn: 'root'
})
export class AccountTypeService {
  private apiUrl = `${env.apiUrl}/${env.api.accountTypes}`;
  private readonly http = inject(HttpClient);

  getAccountTypes(queryParams: Params): Observable<IHttpResponse<IAccountType[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAccountType[]>>(this.apiUrl, {params});
  }

  getAccountTypeDetail(id: string): Observable<IHttpResponse<IAccountType>> {
    return this.http.get<IHttpResponse<IAccountType>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IAccountType): Observable<IHttpResponse<IAccountType>> {
    return this.http.post<IHttpResponse<IAccountType>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IAccountType): Observable<IHttpResponse<IAccountType>> {
    return this.http.post<IHttpResponse<IAccountType>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.accountTypes}/${env.api.classifications}/${env.api.dictionary}`);
  }

}
