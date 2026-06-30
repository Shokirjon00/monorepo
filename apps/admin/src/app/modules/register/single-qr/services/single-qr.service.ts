import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {Params} from '@angular/router';
import {IMerchantBalance} from '@modules/register/merchant-balance/interfaces/merchant-balance.interface';

@Injectable()
export class SingleQrService {
  private apiUrl = `${env.apiUrl}/${env.api.singleQr}`;
  private http =inject(HttpClient);

  getSingleQr(queryParams: Params): Observable<IHttpResponse<IMerchantBalance[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMerchantBalance[]>>(this.apiUrl, {params});
  }
}
