import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {ICommission} from '@modules/directory/commission/interfaces/commission.interface';
import {ISelect} from '@eskhata/util';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdvanceCommissionsService {

  private apiUrl = `${env.apiUrl}/${env.api.commissionAdvance}`;

  constructor(private http: HttpClient) {
  }

  getCommissions(queryParams: Params): Observable<IHttpResponse<ICommission[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICommission[]>>(this.apiUrl,{params});
  }

  getCommissionById(id: string): Observable<IHttpResponse<ICommission>> {
    return this.http.get<IHttpResponse<ICommission>>(`${this.apiUrl}/${id}`);
  }

  getCommissionDetail(id: string): Observable<IHttpResponse<ICommission>> {
    return this.http.get<IHttpResponse<ICommission>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getCommissionDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  updateCommission(data: ICommission): Observable<IHttpResponse<ICommission>> {
    return this.http.post<IHttpResponse<ICommission>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCommission(data: ICommission): Observable<IHttpResponse<ICommission>> {
    return this.http.post<IHttpResponse<ICommission>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
