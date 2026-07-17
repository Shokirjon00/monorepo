import {inject, Injectable} from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {

  private _apiUrl = environment.apiUrl;
  private _http = inject(HttpClient);

  getSearchData(url: string, queryParams: Params = {}): Observable<any> {
    if (['poses/dictionary', 'merchants/dictionary'].includes(url)) {
      return this._http.post(`${this._apiUrl}/${url}`, {...queryParams});
    } else {
      const params = new HttpParams({fromObject: queryParams});
      return this._http.get(`${this._apiUrl}/${url}`, {params});
    }
  }
}
