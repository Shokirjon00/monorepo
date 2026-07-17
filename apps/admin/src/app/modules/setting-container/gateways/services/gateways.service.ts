import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {IGateways} from "@modules/setting-container/gateways/interfaces/gateways";
import {ICountryDetail} from "@modules/directory/country/interfaces/country-detail.interface";

@Injectable()
export class GatewaysService {
  private apiUrl = `${env.apiUrl}/${env.api.gateways}`;
  private readonly http = inject(HttpClient);

  getGateways(queryParams: Params): Observable<IHttpResponse<IGateways[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IGateways[]>>(this.apiUrl, {params});
  }
  getGatewaysDetail(id: string): Observable<IHttpResponse<IGateways>> {
    return this.http.get<IHttpResponse<IGateways>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }
  updateGateways(data: ICountryDetail): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.post<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: ICountryDetail): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.post<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
