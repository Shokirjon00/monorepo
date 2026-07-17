import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {Observable} from 'rxjs';
import {ICity} from '@modules/directory/city/interfaces/city.interface';
import {ICityDetail} from '@modules/directory/city/interfaces/city-detail.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private apiUrl = `${env.apiUrl}/${env.api.cities}`;
  private http = inject(HttpClient);

  getCities(queryParams: Params): Observable<IHttpResponse<ICity[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICity[]>>(this.apiUrl, {params});
  }

  getCityById(id: string): Observable<IHttpResponse<ICityDetail>> {
    return this.http.get<IHttpResponse<ICityDetail>>(`${this.apiUrl}/${id}`);
  }

  getCityDetail(id: string): Observable<IHttpResponse<ICityDetail>> {
    return this.http.get<IHttpResponse<ICityDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCity(data: ICityDetail): Observable<IHttpResponse<ICityDetail>> {
    return this.http.post<IHttpResponse<ICityDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCity(data: ICityDetail): Observable<IHttpResponse<ICityDetail>> {
    return this.http.post<IHttpResponse<ICityDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
