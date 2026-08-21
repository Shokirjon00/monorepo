import { inject, Injectable } from '@angular/core';
import { environment as env } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${env.apiUrl}/${env.api.categories}`;
  private http = inject(HttpClient);

  getCategoryDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
