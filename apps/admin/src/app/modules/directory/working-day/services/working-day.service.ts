import {Injectable} from '@angular/core';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {IWorkingDayDetail} from '@modules/directory/working-day/interfaces/working-day-detail.interface';
import {IWorkingDay} from '@modules/directory/working-day/interfaces/working-day.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WorkingDayService {
  private apiUrl = `${env.apiUrl}/${env.api.merchantWorkDays}`;

  constructor(private http: HttpClient) {
  }

  getWorkDays(queryParams: Params): Observable<IHttpResponse<IWorkingDay[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IWorkingDay[]>>(this.apiUrl, {params});
  }

  getWorkDayDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {params});
  }

  getWorkingDayDetail(id: string): Observable<IHttpResponse<IWorkingDayDetail>> {
    return this.http.get<IHttpResponse<IWorkingDayDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateWorkingDay(data: IWorkingDayDetail): Observable<IHttpResponse<IWorkingDayDetail>> {
    return this.http.post<IHttpResponse<IWorkingDayDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createWorkingDay(data: IWorkingDayDetail): Observable<IHttpResponse<IWorkingDayDetail>> {
    return this.http.post<IHttpResponse<IWorkingDayDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
