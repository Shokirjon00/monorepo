import {HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {environment as env} from '@environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {IMerchantService} from "@modules/client/merchant-service/interfaces/merchant-service.interface";

@Injectable()
export class PosTypeService {

  private apiUrl = `${env.apiUrl}/${env.api.posTypes}`;
  private readonly http = inject(HttpClient)

  getPosTypeDictionary(): Observable<IHttpResponse<IMerchantService[]>> {
    return this.http.get<IHttpResponse<IMerchantService[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

}
