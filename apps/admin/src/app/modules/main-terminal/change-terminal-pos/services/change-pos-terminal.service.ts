import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { Params } from '@angular/router';
import {
  IChangePosTerminal, IChangePosTerminalInfo, IChangePosTerminalUpdate
} from "@modules/main-terminal/change-terminal-pos/interfaces/change-pos-terminal.interface";

@Injectable()
export class ChangePosTerminalService {
  private readonly apiUrl = `${env.apiUrl}/${env.api.terminals}`;
  private readonly http = inject(HttpClient);

  getTerminals(queryParams: Params): Observable<IHttpResponse<IChangePosTerminal[]>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IChangePosTerminal[]>>(this.apiUrl, { params });
  }

  getTerminalById(id: string): Observable<IHttpResponse<IChangePosTerminalInfo>> {
    return this.http.get<IHttpResponse<IChangePosTerminalInfo>>(`${this.apiUrl}/${id}`);
  }

  getUpdateById(id: string): Observable<IHttpResponse<IChangePosTerminalUpdate>> {
    return this.http.get<IHttpResponse<IChangePosTerminalUpdate>>(`${this.apiUrl}/update/${id}`);
  }

  postUpdate(data: IChangePosTerminalUpdate): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/update`, data);
  }
}
