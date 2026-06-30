import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISetting } from '@modules/setting/interface/setting';

@Injectable()
export class SettingService {
  private apiUrl = `${env.apiUrl}/${env.api.companyIntegrationConfigurations}`
  private http = inject(HttpClient)

  getCompanyIntegration(): Observable<IHttpResponse<ISetting>> {
    return this.http.get<IHttpResponse<ISetting>>(`${this.apiUrl}`);
  }

  updateCompanyIntegration(body: ISetting): Observable<IHttpResponse<ISetting>> {
    return this.http.post<IHttpResponse<ISetting>>(`${this.apiUrl}/${env.api.update}`, body);
  }
}
