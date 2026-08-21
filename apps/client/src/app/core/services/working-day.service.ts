import {inject, Injectable} from '@angular/core';
import {environment as env} from "environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {ISelect} from '@eskhata/util';
import {
  IWorkingDayDetail
} from "@modules/merchant-container/merchant/merchant-detail/working-day-edit/interfaces/working-day-detail.interface";

@Injectable()
export class WorkingDayService {
  private apiUrl = `${env.apiUrl}/${env.api.merchantWorkDays}`;

  private http = inject(HttpClient);

  getWorkDayDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getWorkingDayDetail(id: string): Observable<IHttpResponse<IWorkingDayDetail>> {
    return this.http.get<IHttpResponse<IWorkingDayDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateWorkingDay(data: IWorkingDayDetail): Observable<IHttpResponse<IWorkingDayDetail>> {
    return this.http.post<IHttpResponse<IWorkingDayDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }
}
