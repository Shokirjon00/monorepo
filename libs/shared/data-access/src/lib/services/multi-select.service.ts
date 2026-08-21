import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { ENVIRONMENT } from '@eskhata/environment';
import { resolveApiUrl } from '../utils/resolve-api-url';

const POST_ONLY_ENDPOINTS = ['poses/dictionary', 'merchants/dictionary'];

@Injectable({
  providedIn: 'root',
})
export class MultiSelectService {
  private readonly apiUrl = inject(ENVIRONMENT).apiUrl;
  private readonly http = inject(HttpClient);

  getItems(url: string, queryParams: Params = {}): Observable<any> {
    const finalUrl = resolveApiUrl(this.apiUrl, url);

    if (POST_ONLY_ENDPOINTS.includes(url)) {
      return this.http.post(finalUrl, { ...queryParams });
    }

    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get(finalUrl, { params });
  }
}
