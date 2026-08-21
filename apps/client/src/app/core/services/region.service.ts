import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from 'environments/environment';
import { Observable } from 'rxjs';
import { ISelect } from '@eskhata/util';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private apiUrl = `${env.apiUrl}/${env.api.regions}`;
  private http = inject(HttpClient);

  getRegionDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
