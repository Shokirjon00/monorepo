import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ICode } from "@shared/dialogs/code-modal/interface/code";

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private apiUrl = `${env.apiUrl}/${env.api.advancePayouts}`;
  private http = inject(HttpClient);

  resetCode(id: string): Observable<IHttpResponse<ICode>> {
    return this.http.post<IHttpResponse<ICode>>(`${this.apiUrl}/${env.api.resendAdvanceAccessCode}`, {id});
  }

  sendCode(data: { hashCode: string; id: string, advancePayoutId: string }): Observable<IHttpResponse<ICode>> {
    return this.http.post<IHttpResponse<ICode>>(`${this.apiUrl}/${env.api.confirmAdvanceAccessCode}`, data);
  }
}
