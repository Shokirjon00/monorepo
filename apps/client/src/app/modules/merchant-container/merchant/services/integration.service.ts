import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IParam } from '@eskhata/util';

@Injectable()
export class IntegrationService {
  private apiUrl = `${env.apiUrl}/${env.api.merchantIntegrationConfigurations}`
  private http = inject(HttpClient);

  getMerchantIntegration(merchantId: string): Observable<IHttpResponse<IParam>> {
    return this.http.get<IHttpResponse<IParam>>(`${this.apiUrl}/${merchantId}`);
  }

  updateMerchantIntegration(body: IParam): Observable<IHttpResponse<IParam>> {
    return this.http.post<IHttpResponse<IParam>>(`${this.apiUrl}/${env.api.update}`, body);
  }
}
