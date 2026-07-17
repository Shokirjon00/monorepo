import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import { ICompanyDetail } from "@modules/client/company/interfaces/company-detail.interface";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";

@Injectable()
export class PosTerminalService {

  private apiUrl = `${env.apiUrl}/${env.api.posTerminals}`;
  private readonly http =inject(HttpClient);

  getPosTerminal(queryParams: Params): Observable<IHttpResponse<IPosTerminal[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPosTerminal[]>>(this.apiUrl, {params});
  }

  getIBankPromotionById(id: string): Observable<IHttpResponse<IPosTerminal>> {
    return this.http.get<IHttpResponse<IPosTerminal>>(`${this.apiUrl}/${id}`);
  }

  getMobile(queryParams: Params): Observable<IHttpResponse<IPosTerminal[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IPosTerminal[]>>(`${this.apiUrl}/${env.api.posTerminalMobile}`, {params});
  }

  getUpdateDetail(id: string): Observable<IHttpResponse<IPosTerminal>> {
    return this.http.get<IHttpResponse<IPosTerminal>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getUpdate(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IPosTerminal>> {
    return this.http.post<IHttpResponse<IPosTerminal>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }

  removePosTerminal(id: string): Observable<IHttpResponse<ICompanyDetail>> {
    return this.http.post<IHttpResponse<ICompanyDetail>>(`${env.apiUrl}/${env.api.posTerminals}/${env.api.delete}/${id}`, {});
  }

}
