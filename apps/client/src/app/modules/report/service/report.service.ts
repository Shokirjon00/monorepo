import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';
import { IReportForm } from '@modules/report/interface/report-form.interface';

@Injectable()
export class ReportService {
  private apiUrl = `${env.apiUrl}/${env.api.reports}`;
  private http = inject(HttpClient);

  getReportDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  generateReport(data: IReportForm): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${env.api.generate}`, data, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
