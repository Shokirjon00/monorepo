import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from 'environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SubcategoryService {
  private apiUrl = `${env.apiUrl}/${env.api.subcategories}`;
  private http = inject(HttpClient);

  getSubcategoryDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({ fromObject: queryParams });

    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, { params });
  }
}
