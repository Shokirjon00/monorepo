import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { environment as env } from "@environments/environment";
import { Params } from "@angular/router";
import { IMenu } from "@modules/food/menu/interfaces/menus.interface";
import { IMenuDetail } from "@modules/food/menu/interfaces/menu-detail.interface";
import { IShiftHistory } from "@modules/shift-history/interfaces/shift-history";

@Injectable()
export class ProductsService {

  private productsUrl = `${env.apiFoodUrl}/${env.api.foodProducts}`;

  private http = inject(HttpClient);

  getProductList(queryParams: Params): Observable<IHttpResponse<IMenu[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IMenu[]>>(`${this.productsUrl}`, {params});
  }

  getUpdateDetail(id: string): Observable<IHttpResponse<IMenuDetail>> {
    return this.http.get<IHttpResponse<IMenuDetail>>(`${this.productsUrl}/${id}/${env.api.edit}`);
  }

  changeActiveStatus(id: string, data: any): Observable<IHttpResponse<IMenuDetail>> {
    return this.http.post<IHttpResponse<IMenuDetail>>(`${this.productsUrl}/${id}/${env.api.update}`, data);
  }
}
