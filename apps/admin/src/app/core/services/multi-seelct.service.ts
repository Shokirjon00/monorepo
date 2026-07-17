import { inject, Injectable } from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MultiSelectService {
  private _apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getItems(url: string, queryParams: Params = {}): Observable<any> {
    if (['poses/dictionary', 'merchants/dictionary'].includes(url)) {
      return this.http.post(`${this._apiUrl}/${url}`, {...queryParams});
    } else {
      const params = new HttpParams({fromObject: queryParams});
      return this.http.get(`${this._apiUrl}/${url}`, {params});
    }
  }
}
