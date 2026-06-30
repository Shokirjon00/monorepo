import { inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IMerchantHistory } from '@modules/merchant-container/merchant-histories/interfaces/company-registration-history.interfaces';
import { Params } from '@angular/router';

export class MerchantApplicationService {
  form: FormGroup;
  private apiUrl = `${env.apiUrl}/${env.api.merchantApplications}`;
  private http = inject(HttpClient);

  getMerchantHistories(queryParams: Params): Observable<IHttpResponse<IMerchantHistory[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IMerchantHistory[]>>(`${this.apiUrl}`, { params });
  }
}
