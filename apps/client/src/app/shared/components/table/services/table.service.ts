import { inject, Injectable } from '@angular/core';
import {environment} from "@environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Params} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getReport(url: string, queryParams: Params = {}): Observable<any> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get(`${this.apiUrl}/${url}`,
      {params, responseType: 'blob', observe: 'response'});
  }
}
