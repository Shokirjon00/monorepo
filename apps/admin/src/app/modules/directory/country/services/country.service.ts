import { inject, Injectable } from '@angular/core';
import {environment as env} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {ISelect} from '@core/interfaces/select.interface';
import {ICountry} from '@modules/directory/country/interfaces/country.interface';
import {ICountryDetail} from '@modules/directory/country/interfaces/country-detail.interface';
import {Params} from '@angular/router';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class CountryService {

  private apiUrl = `${env.apiUrl}/${env.api.countries}`;
  private readonly http = inject(HttpClient);

  getCountries(queryParams: Params): Observable<IHttpResponse<ICountry[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICountry[]>>(this.apiUrl, {params});
  }

  getCountryById(id: string): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.get<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${id}`);
  }

  getCountryDetail(id: string): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.get<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getCountryDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  updateCountry(data: ICountryDetail): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.post<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCountry(data: ICountryDetail): Observable<IHttpResponse<ICountryDetail>> {
    return this.http.post<IHttpResponse<ICountryDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
