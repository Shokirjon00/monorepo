import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from 'environments/environment';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {ISubcategoryDetail} from '@modules/directory/subcategory/interfaces/subcategory-detail.interface';
import {Params} from '@angular/router';
import {ISubcategory} from '@modules/directory/subcategory/interfaces/subcategory.interface';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private apiUrl = `${env.apiUrl}/${env.api.subcategories}`;
  private http = inject(HttpClient);

  getSubcategories(queryParams: Params): Observable<IHttpResponse<ISubcategory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISubcategory[]>>(this.apiUrl, {params});
  }

  getSubcategoryById(id: string): Observable<IHttpResponse<ISubcategoryDetail>> {
    return this.http.get<IHttpResponse<ISubcategoryDetail>>(`${this.apiUrl}/${id}`);
  }

  getSubcategoryDetail(id: string): Observable<IHttpResponse<ISubcategoryDetail>> {
    return this.http.get<IHttpResponse<ISubcategoryDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getSubcategoryDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`,{params});
  }

  updateSubcategory(data: ISubcategoryDetail): Observable<IHttpResponse<ISubcategoryDetail>> {
    return this.http.post<IHttpResponse<ISubcategoryDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createSubcategory(data: ISubcategoryDetail): Observable<IHttpResponse<ISubcategoryDetail>> {
    return this.http.post<IHttpResponse<ISubcategoryDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
