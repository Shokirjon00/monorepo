import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { IComissionType } from "@modules/directory/commission-type/interfaces/commission-type.interface";

@Injectable()
export class CommissionTypeService {
  private readonly apiUrl = `${env.apiUrl}/${env.api.commissionTypes}`;
  private readonly http = inject(HttpClient);

  getCommissionList(queryParams: Params): Observable<IHttpResponse<IComissionType[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IComissionType[]>>(this.apiUrl, {params});
  }
}
