import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ISource } from '@eskhata/util';
import { ENVIRONMENT } from '@eskhata/environment';
import { resolveApiUrl } from '../utils/resolve-api-url';

@Injectable()
export class DataSourceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ENVIRONMENT).apiUrl;

  getSource(source: ISource, params = {}): Observable<any> {
    const link = resolveApiUrl(this.apiUrl, source.link);

    if (source.method === 'post') {
      return this.http.post<any>(link, params);
    } else if (source.method === 'get') {
      return this.http.get<any>(link, { params });
    } else {
      console.warn(`404 Api ${source.link} NOT Found`);
      return of([]);
    }
  }
}
