import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from 'environments/environment';
import { Observable } from 'rxjs';
import { ISelect } from '@core/interfaces/select.interface';
import { IRegion } from '@modules/directory/region/interfaces/region.interface';
import { IRegionDetail } from '@modules/directory/region/interfaces/region-detail.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  private apiUrl = `${env.apiUrl}/${env.api.regions}`;
  private http = inject(HttpClient);

  getRegions(queryParams: Params): Observable<IHttpResponse<IRegion[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IRegion[]>>(this.apiUrl, {params});
  }

  getRegionById(id: string): Observable<IHttpResponse<IRegionDetail>> {
    return this.http.get<IHttpResponse<IRegionDetail>>(`${this.apiUrl}/${id}`);
  }

  getRegionDetail(id: string): Observable<IHttpResponse<IRegionDetail>> {
    return this.http.get<IHttpResponse<IRegionDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getRegionDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams})
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {params});
  }

  update(data: IRegionDetail): Observable<IHttpResponse<IRegionDetail>> {
    return this.http.post<IHttpResponse<IRegionDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IRegionDetail): Observable<IHttpResponse<IRegionDetail>> {
    return this.http.post<IHttpResponse<IRegionDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
