import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IAppealCategoryDetail } from "@modules/directory/appeal-category/interfaces/appeal-category-detail.interface";
import { IAppealCategory } from "@modules/directory/appeal-category/interfaces/appeal-category.interface";


@Injectable()
export class AppealCategoryService {

  private apiUrl = `${env.apiUrl}/${env.api.supportApplicationCategories}`;
  private http = inject(HttpClient);

  getCategories(queryParams: Params): Observable<IHttpResponse<IAppealCategory[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAppealCategory[]>>(this.apiUrl, {params});
  }

  getCategoryById(id: string): Observable<IHttpResponse<IAppealCategoryDetail>> {
    return this.http.get<IHttpResponse<IAppealCategoryDetail>>(`${this.apiUrl}/${id}`)
  }

  getCategoryDetail(id: string): Observable<IHttpResponse<IAppealCategoryDetail>> {
    return this.http.get<IHttpResponse<IAppealCategoryDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCategory(data: any): Observable<IHttpResponse<IAppealCategoryDetail>> {
    return this.http.post<IHttpResponse<IAppealCategoryDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCategory(data: any): Observable<IHttpResponse<IAppealCategoryDetail>> {
    return this.http.post<IHttpResponse<IAppealCategoryDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}

