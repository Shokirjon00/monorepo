import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@environments/environment";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { Observable } from "rxjs";
import { ISelect } from "@core/interfaces/select.interface";
import { IUsers } from "@modules/user-container/user/interfaces/users.interface";
import { Params } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class PosTerminalService {
  private apiUrl = `${env.apiUrl}/${env.api.posTerminalUsers}`;
  private http = inject(HttpClient);

  getPosTerminal(queryParams: Params): Observable<IHttpResponse<IUsers[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IUsers[]>>(this.apiUrl, {params});
  }

  getPosTerminalById(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${id}`);
  }

  getPosTerminalDetail(id: string): Observable<IHttpResponse<IUsers>> {
    return this.http.get<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updatePosTerminal(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createPosTerminal(data: IUsers): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getPosTerminalDictionaryRoles(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.posTerminalUserRoles}/${env.api.dictionary}`);
  }

  resetPassword(id: {id: string}): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.resetPassword}`, id);
  }

  sendFirstLoginData(id: {id: string}): Observable<IHttpResponse<IUsers>> {
    return this.http.post<IHttpResponse<IUsers>>(`${this.apiUrl}/${env.api.sendFirstLoginData}`, id);
  }
}
