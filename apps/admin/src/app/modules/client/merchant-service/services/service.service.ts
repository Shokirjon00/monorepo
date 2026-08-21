import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';
import { Params } from "@angular/router";

@Injectable()
export class ParamService {

  private apiUrl = `${env.apiUrl}/${env.api.serviceParams}`;
  private readonly http = inject(HttpClient)

  getParamDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, {
      params: queryParams,
    });
  }
}
