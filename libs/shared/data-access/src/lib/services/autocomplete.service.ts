import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { ENVIRONMENT } from '@eskhata/environment';
import { resolveApiUrl } from '../utils/resolve-api-url';

/**
 * Endpoints that only answer to POST. The list is the union of both apps'
 * previous copies — admin knew the first two, client also knew the third.
 */
const POST_ONLY_ENDPOINTS = ['poses/dictionary', 'merchants/dictionary', 'poses/dictionary_without_pagination'];

@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  private readonly apiUrl = inject(ENVIRONMENT).apiUrl;
  private readonly http = inject(HttpClient);

  getSearchData(url: string, queryParams: Params = {}): Observable<any> {
    const finalUrl = resolveApiUrl(this.apiUrl, url);

    if (POST_ONLY_ENDPOINTS.includes(url)) {
      return this.http.post(finalUrl, { ...queryParams });
    }

    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get(finalUrl, { params });
  }
}
