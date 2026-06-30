import {inject, Injectable} from '@angular/core';
import {environment as env} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = `${env.apiUrl}/${env.api.currencies}`;
  private http = inject(HttpClient);

  getCurrenciesList(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}`)
  }

  getCurrenciesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
