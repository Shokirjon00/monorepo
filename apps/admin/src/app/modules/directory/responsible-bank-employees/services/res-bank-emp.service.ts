import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IResBankEmp} from '@modules/directory/responsible-bank-employees/interfaces/res-bank-emp.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ResBankEmpService {
  private apiUrl = `${env.apiUrl}/${env.api.resBankEmp}`;
  private http = inject(HttpClient);

  getResBankEmps(queryParams: Params): Observable<IHttpResponse<IResBankEmp[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IResBankEmp[]>>(this.apiUrl, {params});
  }

  getResBankEmpById(id: string): Observable<IHttpResponse<IResBankEmp>> {
    return this.http.get<IHttpResponse<IResBankEmp>>(`${this.apiUrl}/${id}`);
  }

  getResBankEmpDetail(id: string): Observable<IHttpResponse<IResBankEmp>> {
    return this.http.get<IHttpResponse<IResBankEmp>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateResBankEmp(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createResBankEmp(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
