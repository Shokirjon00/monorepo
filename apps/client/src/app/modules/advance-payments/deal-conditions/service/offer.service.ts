import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IAdvanceAccessCode } from "@modules/advance-payments/deal-conditions/interface/advance-access-code";

@Injectable()
export class OfferService {
  private apiUrl = `${env.apiUrl}/${env.api.advancePayouts}`;
  private readonly http = inject(HttpClient);

  send(id: any): Observable<IHttpResponse<IAdvanceAccessCode>> {
    return this.http.post<IHttpResponse<IAdvanceAccessCode>>(`${this.apiUrl}/${env.api.advanceAccessCode}`, id);
  }
}
