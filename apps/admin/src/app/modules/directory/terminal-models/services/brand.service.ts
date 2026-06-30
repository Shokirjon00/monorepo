import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment as env, environment} from '@environments/environment';
import { Observable } from 'rxjs';
import {Params} from "@angular/router";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {ISubcategory} from "@modules/directory/subcategory/interfaces/subcategory.interface";
import {ISubcategoryDetail} from "@modules/directory/subcategory/interfaces/subcategory-detail.interface";
import {ISelect} from "@core/interfaces";
import {IBrand} from "@modules/directory/terminal-models/interfaces/brand.interface";
import {IBrandDetail} from "@modules/directory/terminal-models/interfaces/brand-detail.interface";

@Injectable({ providedIn: 'root' })
export class BrandService {

  private apiUrl = `${env.apiUrl}/${env.api.terminalModels}`;
  private http = inject(HttpClient);

  getBrand(queryParams: Params): Observable<IHttpResponse<IBrand[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBrand[]>>(this.apiUrl, {params});
  }

  getBrands(id: string): Observable<IHttpResponse<IBrandDetail>> {
    return this.http.get<IHttpResponse<IBrandDetail>>(`${this.apiUrl}/${id}`);
  }

  getBrandById(id: string): Observable<IHttpResponse<ISubcategoryDetail>> {
    return this.http.get<IHttpResponse<ISubcategoryDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getBrandDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`,{params});
  }

  updateBrand(data: ISubcategoryDetail): Observable<IHttpResponse<IBrandDetail>> {
    return this.http.post<IHttpResponse<IBrandDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createBrand(data: ISubcategoryDetail): Observable<IHttpResponse<IBrandDetail>> {
    return this.http.post<IHttpResponse<IBrandDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}

