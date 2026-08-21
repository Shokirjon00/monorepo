import {HttpClient, HttpParams} from '@angular/common/http';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Observable} from 'rxjs';
import { inject, Injectable } from '@angular/core';
import {environment as env} from 'environments/environment';
import {ISelect} from '@eskhata/util';
import {IAreaDetail} from '@modules/directory/area/interfaces/area-detail.interface';
import {IArea} from '@modules/directory/area/interfaces/area.interface';
import {Params} from '@angular/router';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class AreaService {

  private apiUrl = `${env.apiUrl}/${env.api.areas}`;
  private readonly http = inject(HttpClient);

  getAreas(queryParams: Params): Observable<IHttpResponse<IArea[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IArea[]>>(this.apiUrl, {params});
  }

  getAreaById(id: string): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.get<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${id}`);
  }

  getAreaDetail(id: string): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.get<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getAreaDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`,{params});
  }

  update(data: IAreaDetail): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.post<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IAreaDetail): Observable<IHttpResponse<IAreaDetail>> {
    return this.http.post<IHttpResponse<IAreaDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
