import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import {
  ISetting,
} from '@modules/setting-container/setting/interfaces/setting.interface';
import { UpdateWithComponents } from "@modules/setting-container/setting/interfaces/update-with-components";
import {
  ISettingComponents
} from "@modules/setting-container/setting/setting-components/interface/setting-components";
import { IComponent } from "@modules/setting-container/setting/interfaces/components";

@Injectable()
export class SettingService {
  private apiUrl = `${env.apiUrl}/${env.api.settings}`;
  private apiSettingUrl = `${env.apiUrl}/${env.api.settingComponents}`;
  private http = inject(HttpClient);

  getSettings(queryParams: Params): Observable<IHttpResponse<ISetting[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISetting[]>>(this.apiUrl, {params});
  }

  getSettingUpdate(id: string): Observable<IHttpResponse<ISetting>> {
    return this.http.get<IHttpResponse<ISetting>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getSettingDetail(settingId: string): Observable<IHttpResponse<ISetting>> {
    return this.http.get<IHttpResponse<ISetting>>(`${this.apiUrl}/${settingId}`);
  }

  getSettingComponent(id: string): Observable<IHttpResponse<IComponent[]>> {
    return this.http.get<IHttpResponse<IComponent[]>>(`${this.apiSettingUrl}/${env.api.update}/${id}`);
  }

  updateSettingComponents(data: {updateSettingComponents: ISettingComponents[]; settingId: string}): Observable<IHttpResponse<ISettingComponents>> {
    return this.http.post<IHttpResponse<ISettingComponents>>(`${this.apiSettingUrl}/${env.api.update}`, data);
  }

  updateSetting(data: ISetting): Observable<IHttpResponse<ISetting>> {
    return this.http.post<IHttpResponse<ISetting>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  updateWithComponents(data: UpdateWithComponents): Observable<IHttpResponse<UpdateWithComponents>> {
    return this.http.post<IHttpResponse<UpdateWithComponents>>(`${this.apiUrl}/${env.api.updateWithComponents}`, data);
  }

}
