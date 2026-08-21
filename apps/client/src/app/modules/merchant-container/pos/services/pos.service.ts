import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';
import { IPos, IPosDetail } from '@modules/merchant-container/pos/interfaces/pos.interface';
import { Params } from '@angular/router';

@Injectable()
export class PosService {
  private apiUrl = `${env.apiUrl}/${env.api.poses}`;
  private http = inject(HttpClient);

  getPoses(queryParams: Params): Observable<IHttpResponse<IPos[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IPos[]>>(`${this.apiUrl}`, { params });
  }

  getPosDictionaryWithoutPagination(queryParams: Params, bodyParams: Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.post<IHttpResponse<ISelect[]>>(
      `${this.apiUrl}/${env.api.dictionaryWithoutPagination}`,
      bodyParams,
      { params: params }
    );
  }

  getDetail(id: string): Observable<IHttpResponse<IPosDetail>> {
    return this.http.get<IHttpResponse<IPosDetail>>(`${this.apiUrl}/${id}`);
  }

  getPosUpdateDetail(id: string): Observable<IHttpResponse<IPosDetail>> {
    return this.http.get<IHttpResponse<IPosDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updatePos(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${env.api.update}`, data);
  }

  createPos(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getPosTypeDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.posTypes}/${env.api.dictionary}`);
  }

  getPosDictionary(queryParams: Params): Observable<IHttpResponse<ISelect[]>> {
    return this.http.post<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`, { ...queryParams });
  }

  getQRCode(id: string): Observable<IHttpResponse<any>> {
    return this.http.get<IHttpResponse<any>>(`${this.apiUrl}/${env.api.qr}/${id}`);
  }

  getEQMSQRCode(id: string): Observable<IHttpResponse<string>> {
    return this.http.get<IHttpResponse<string>>(`${this.apiUrl}/${env.api.qrText}/${id}`);
  }

  getSetting(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${env.api.settings}/${id}`, { responseType: 'blob', observe: 'response' });
  }
}
