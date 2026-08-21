import { inject, Injectable } from '@angular/core';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {ICategory} from '@modules/directory/category/interfaces/category.interface';
import {ICategoryDetail} from '@modules/directory/category/interfaces/category-detail.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${env.apiUrl}/${env.api.categories}`;
  private readonly http = inject(HttpClient);

  getCategories(queryParams: Params): Observable<IHttpResponse<ICategory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICategory[]>>(this.apiUrl, {params});
  }

  getCategoryById(id: string): Observable<IHttpResponse<ICategoryDetail>> {
    return this.http.get<IHttpResponse<ICategoryDetail>>(`${this.apiUrl}/${id}`)
  }

  getCategoryDetail(id: string): Observable<IHttpResponse<ICategoryDetail>> {
    return this.http.get<IHttpResponse<ICategoryDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getCategoryDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  updateCategory(data: ICategoryDetail): Observable<IHttpResponse<ICategoryDetail>> {
    return this.http.post<IHttpResponse<ICategoryDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCategory(data: ICategoryDetail): Observable<IHttpResponse<ICategoryDetail>> {
    return this.http.post<IHttpResponse<ICategoryDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
