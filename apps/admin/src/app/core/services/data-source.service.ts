import {inject, Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ISource } from "@modules/transactions/interface/source";
import { Observable, of } from "rxjs";
import { environment as env } from "@environments/environment";


@Injectable()
export class DataSourceService {
  private http = inject(HttpClient);

  getSource(source: ISource, params = {}): Observable<any> {
    if (source.method === 'post') {
      return this.http.post<any>(`${env.apiUrl}/${source.link}`, params);
    } else if (source.method === 'get') {
      return this.http.get<any>(`${env.apiUrl}/${source.link}`, { params });
    } else {
      console.warn(`404 Api ${source.link} NOT Found`);
      return of([]);
    }
  }
}
