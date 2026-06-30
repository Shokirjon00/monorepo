import {Observable} from 'rxjs';
import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ICompanySegment} from '@modules/directory/company-segment/interfaces/company-segment.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CompanySegmentService {
  private apiUrl = `${env.apiUrl}/${env.api.companySegments}`;
  private readonly http = inject(HttpClient);

  getCompanySegments(queryParams: Params): Observable<IHttpResponse<ICompanySegment[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICompanySegment[]>>(this.apiUrl, {params});
  }

  getCompanySegmentById(id: string): Observable<IHttpResponse<ICompanySegment>> {
    return this.http.get<IHttpResponse<ICompanySegment>>(`${this.apiUrl}/${id}`);
  }

  getCompanySegmentDetail(id: string): Observable<IHttpResponse<ICompanySegment>> {
    return this.http.get<IHttpResponse<ICompanySegment>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  createCompanySegment(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data)
  }

  updateCompanySegment(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data)
  }

}
