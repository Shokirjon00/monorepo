import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IImportExcelResult } from "@modules/main-terminal/change-terminal-pos/interfaces/change-pos-terminal.interface";

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getReport(url: string, queryParams: Params = {}): Observable<any> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get(`${this.apiUrl}/${url}`, {params, responseType: 'blob', observe: 'response'});
  }

  queueExport(url: string, queryParams: Params = {}): Observable<any> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get(`${this.apiUrl}/${url}`, {params});
  }

  getReportCompanyRegistration(url: string, queryParams: Params = {}): Observable<HttpResponse<Blob>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get(`${this.apiUrl}/${url}`, {params, responseType: 'blob', observe: 'response'});
  }

  importExcel(url: string, file: File): Observable<IHttpResponse<IImportExcelResult>> {
    const formData = new FormData();
    formData.append('ExcelFile', file);
    return this.http.post<IHttpResponse<IImportExcelResult>>(`${this.apiUrl}/${url}`, formData);
  }
}
