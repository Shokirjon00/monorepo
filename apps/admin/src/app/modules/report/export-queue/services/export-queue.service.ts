import {inject, Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@environments/environment';
import {IExportQueueData} from "@modules/report/export-queue/interfaces/export-queue-data";

@Injectable()
export class ExportQueueService {
  private apiUrl = `${env.apiUrl}/${env.api.adminReports}`;
  private http = inject(HttpClient);

  getAdminExports(queryParams: Params): Observable<IHttpResponse<IExportQueueData[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IExportQueueData[]>>(this.apiUrl, {params});
  }

}
