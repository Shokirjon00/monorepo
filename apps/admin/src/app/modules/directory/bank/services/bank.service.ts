import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBank } from '@modules/directory/bank/interfaces/bank.interface';
import { ISelect } from '@core/interfaces/select.interface';
import { IBankDetail } from '@modules/directory/bank/interfaces/bank-detail.intefrace';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class BankService {
  private apiUrl = `${env.apiUrl}/${env.api.banks}`;
  private http = inject(HttpClient);

  getBanks(queryParams: Params): Observable<IHttpResponse<IBank[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBank[]>>(this.apiUrl,{params});
  }

  getBankById(id: string): Observable<IHttpResponse<IBankDetail>> {
    return this.http.get<IHttpResponse<IBankDetail>>(`${this.apiUrl}/${id}`);
  }

  getBankDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  create(data: IBankDetail): Observable<IHttpResponse<IBankDetail>> {
    return this.http.post<IHttpResponse<IBankDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getBankDetail(id: string): Observable<IHttpResponse<IBankDetail>> {
    return this.http.get<IHttpResponse<IBankDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IBankDetail): Observable<IHttpResponse<IBankDetail>> {
    return this.http.post<IHttpResponse<IBankDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  uploadLogo(photo: FormData): Observable<IHttpResponse<IBankDetail>> {
    return this.http.post<IHttpResponse<IBankDetail>>(`${this.apiUrl}/${env.api.uploadIcon}`, photo);
  }
}
