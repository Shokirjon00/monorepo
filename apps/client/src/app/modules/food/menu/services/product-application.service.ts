import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { environment as env } from "@environments/environment";
import { Params } from "@angular/router";
import { IMenu } from "@modules/food/menu/interfaces/menus.interface";
import { IMenuDetail } from "@modules/food/menu/interfaces/menu-detail.interface";
import { IParam } from "@core/interfaces";

@Injectable()
export class ProductApplicationsService {

  private productApplicationsUrl = `${env.apiFoodUrl}/${env.api.foodProductApplications}`;

  private http = inject(HttpClient);

  getProductApplicationList(queryParams: Params): Observable<IHttpResponse<IMenu[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMenu[]>>(`${this.productApplicationsUrl}`, {params});
  }

  getUpdateDetail(id: string): Observable<IHttpResponse<IMenuDetail>> {
    return this.http.get<IHttpResponse<IMenuDetail>>(`${this.productApplicationsUrl}/${id}/${env.api.edit}`);
  }

  update(id: string, data: any): Observable<IHttpResponse<IParam>> {
    return this.http.post<IHttpResponse<IParam>>(`${this.productApplicationsUrl}/${id}/${env.api.update}`, data);
  }

  create(data: any): Observable<IHttpResponse<IParam>> {
    return this.http.post<IHttpResponse<IParam>>(`${this.productApplicationsUrl}/${env.api.create}`, data);
  }
}
