import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {IRegistryAbsSync} from "@modules/register/registry-abs-sync/interfaces/registry-abs-sync";

@Injectable()
export class RegistryAbsSyncService {
  private apiUrl = `${env.apiUrl}/${env.api.registry_abs_sync}`;
  private http = inject(HttpClient);

  getRegistryAbsSync(queryParams: Params): Observable<IHttpResponse<IRegistryAbsSync[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IRegistryAbsSync[]>>(this.apiUrl, {params});
  }
}
