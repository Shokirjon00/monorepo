import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ISource } from "@core/interfaces/source";


@Injectable()
export class DataSourceService {
  private readonly http = inject(HttpClient);

  getSource(source: ISource, params = {}): Observable<any> {
    if (source.method === 'post') {
      return this.http.post<any>(`${source.link}`, params);
    } else if (source.method === 'get') {
      return this.http.get<any>(`${source.link}`, { params });
    } else {
      console.warn(`404 Api ${source.link} NOT Found`);
      return of([]);
    }
  }
}
