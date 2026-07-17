import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ICompanyLegalForm} from '@modules/directory/company-legal-form/interfaces/company-legal-form.interface';
import {Params} from '@angular/router';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class CompanyLegalFormService {

  private apiUrl = `${env.apiUrl}/${env.api.companyLegalForms}`;
  private http = inject(HttpClient);

  getLegalForms(queryParams: Params): Observable<IHttpResponse<ICompanyLegalForm[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICompanyLegalForm[]>>(this.apiUrl, {params});
  }

  getLegalFormById(id: string): Observable<IHttpResponse<ICompanyLegalForm>> {
    return this.http.get<IHttpResponse<ICompanyLegalForm>>(`${this.apiUrl}/${id}`);
  }

  getLegalFormDetail(id: string): Observable<IHttpResponse<ICompanyLegalForm>> {
    return this.http.get<IHttpResponse<ICompanyLegalForm>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: ICompanyLegalForm): Observable<IHttpResponse<ICompanyLegalForm>> {
    return this.http.post<IHttpResponse<ICompanyLegalForm>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: ICompanyLegalForm): Observable<IHttpResponse<ICompanyLegalForm>> {
    return this.http.post<IHttpResponse<ICompanyLegalForm>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
