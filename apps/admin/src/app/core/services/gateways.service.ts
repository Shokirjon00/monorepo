import {environment as env} from '@environments/environment';
import { inject, Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@eskhata/util';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GatewaysService{
  private apiUrl = `${env.apiUrl}/${env.api.gateways}`;
  private http = inject(HttpClient);

  getTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
