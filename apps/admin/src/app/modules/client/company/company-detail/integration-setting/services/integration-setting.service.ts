import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IIntegrationSetting } from '@modules/client/company/company-detail/integration-setting/interfaces/integration-setting';
import { IIntegration } from '@modules/client/merchant/interfaces/integration.interface';
import { IIntegrationType } from '@modules/client/company/company-detail/integration-setting/interfaces/integration-type';

@Injectable({
  providedIn: 'root'
})
export class IntegrationSettingService {
  private apiUrl = `${env.apiUrl}`;
  private http = inject(HttpClient);

  getIntegrationSettingList(queryParams: Params): Observable<IHttpResponse<IIntegrationSetting[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IIntegrationSetting[]>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}`, {params});
  }

  getIntegrationSettingDetail(integrationId: string): Observable<IHttpResponse<IIntegration[]>> {
    return this.http.get<IHttpResponse<IIntegration[]>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${integrationId}`);
  }

  getIntegrationSettingById(id: string): Observable<IHttpResponse<IIntegrationSetting>> {
    return this.http.get<IHttpResponse<IIntegrationSetting>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${env.api.update}/${id}`, {});
  }

  createIntegrationSetting(body: IIntegration): Observable<IHttpResponse<IIntegrationSetting>> {
    return this.http.post<IHttpResponse<IIntegrationSetting>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${env.api.create}`, body);
  }

  updateIntegrationSetting(body: any): Observable<IHttpResponse<IIntegrationSetting>> {
    return this.http.post<IHttpResponse<IIntegrationSetting>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${env.api.update}`, body);
  }

  deleteIntegrationSetting(body: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${env.api.delete}`, body);
  }

  replaceIntegrationSetting(body: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.merchantIntegrationConfigurations}/${env.api.replace}`, body);
  }

  getIntegrationTypesList(): Observable<IHttpResponse<IIntegrationType[]>> {
    return this.http.get<IHttpResponse<IIntegrationType[]>>(`${this.apiUrl}/${env.api.integrationTypes}/${env.api.dictionary}`);
  }

  getCompanyIntegrationConfigurations(companyId: string): Observable<IHttpResponse<any>> {
    return this.http.get<IHttpResponse<any>>(`${this.apiUrl}/${env.api.companyIntegrationConfigurations}/${companyId}`);
  }

  updateCompanyIntegrationConfiguration(body: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.companyIntegrationConfigurations}/${env.api.update}`, body);
  }
}
