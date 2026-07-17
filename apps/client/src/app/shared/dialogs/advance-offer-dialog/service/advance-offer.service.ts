import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { environment as env } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { IOffer } from "@shared/dialogs/advance-offer-dialog/interface/offer";

@Injectable()
export class AdvanceOfferService {
  private apiUrl = `${env.apiUrl}/${env.api.advancePayouts}`;
  private apiUrlOffer = `${env.apiUrl}/${env.api.advancePayoutOffers}`;
  private readonly http = inject(HttpClient);

  check(): Observable<IHttpResponse<unknown>> {
    return this.http.get<IHttpResponse<unknown>>(`${(this.apiUrl)}/${env.api.check}`);
  }

  getAdvancePayoutOffer(): Observable<IHttpResponse<IOffer>> {
    return this.http.get<IHttpResponse<IOffer>>(`${this.apiUrlOffer}/${env.api.available}`);
  }

  sendLater(id: string): Observable<IHttpResponse<IOffer>> {
    return this.http.post<IHttpResponse<IOffer>>(`${this.apiUrlOffer}/${env.api.hide}`, {id});
  }

}
