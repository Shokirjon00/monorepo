import { inject, Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IDeviceTypeDetail} from '@modules/directory/device-type/interfaces/device-type-detail.interface';
import {IDeviceType} from '@modules/directory/device-type/interfaces/device-type.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class DeviceTypeService {
  private apiUrl = `${env.apiUrl}/${env.api.deviceType}`;
  private readonly http = inject(HttpClient);

  getDeviceTypes(queryParams: Params): Observable<IHttpResponse<IDeviceType[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IDeviceType[]>>(this.apiUrl, {params});
  }

  getDeviceTypeDetail(id: string): Observable<IHttpResponse<IDeviceTypeDetail>> {
    return this.http.get<IHttpResponse<IDeviceTypeDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  update(data: IDeviceTypeDetail): Observable<IHttpResponse<IDeviceTypeDetail>> {
    return this.http.post<IHttpResponse<IDeviceTypeDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  create(data: IDeviceTypeDetail): Observable<IHttpResponse<IDeviceTypeDetail>> {
    return this.http.post<IHttpResponse<IDeviceTypeDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
