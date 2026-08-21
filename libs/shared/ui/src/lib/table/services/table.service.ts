import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { ENVIRONMENT } from '@eskhata/environment';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ENVIRONMENT).apiUrl;

  getReport(url: string, queryParams: Params = {}): Observable<any> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get(`${this.apiUrl}/${url}`, { params, responseType: 'blob', observe: 'response' });
  }

  queueExport(url: string, queryParams: Params = {}): Observable<any> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get(`${this.apiUrl}/${url}`, { params });
  }

  getReportCompanyRegistration(url: string, queryParams: Params = {}): Observable<HttpResponse<Blob>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get(`${this.apiUrl}/${url}`, { params, responseType: 'blob', observe: 'response' });
  }

  importExcel<T>(url: string, file: File): Observable<T> {
    const formData = new FormData();
    formData.append('ExcelFile', file);
    return this.http.post<T>(`${this.apiUrl}/${url}`, formData);
  }
}
