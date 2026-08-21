import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISelect } from '@eskhata/util';
import { IHttpResponse } from '@core/interfaces/http-response.interface';

@Injectable()
export class SupportCenterCategoryService {
  private apiUrl = `${env.apiUrl}/${env.api.supportApplicationsCategories}`;

  private http = inject(HttpClient);

  getCategories(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
