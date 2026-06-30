import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import { environment as env } from "@environments/environment";
import {Params} from "@angular/router";
import {IListAddresses} from "@modules/sms-notification/list-addresses/interface/list-addresses";

@Injectable()
export class ListAddressesService {
  private apiUrl = `${env.apiUrl}/${env.api.posMessengers}`;
  private http = inject(HttpClient);

  getList(queryParams: Params): Observable<IHttpResponse<IListAddresses[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IListAddresses[]>>(this.apiUrl, {params});
  }

  checklistStatus(id: string): Observable<IHttpResponse<IListAddresses[]>> {
    return this.http.post<IHttpResponse<IListAddresses[]>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }
}
