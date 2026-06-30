import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  private _apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getSearchData(url: string, queryParams: Params = {}): Observable<any> {
    const isFullUrl = url.startsWith('http');

    const finalUrl = isFullUrl ? url : `${this._apiUrl}/${url}`;

    if (url === 'poses/dictionary' || url === 'merchants/dictionary' || url === 'poses/dictionary_without_pagination') {
      return this.http.post(finalUrl, { ...queryParams });
    } else {
      const params = new HttpParams({ fromObject: queryParams });
      return this.http.get(finalUrl, { params });
    }
  }
}
