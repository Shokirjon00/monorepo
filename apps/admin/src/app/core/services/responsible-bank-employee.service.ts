import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ResponsibleBankEmployeeService {
  private apiUrl = `${env.apiUrl}/${env.api.responsibleBankEmployee}`;
  private http = inject(HttpClient);

  getResponsibleBankEmployees(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getResponsibleBankEmployeesDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject:queryParams})
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {params});
  }
}
