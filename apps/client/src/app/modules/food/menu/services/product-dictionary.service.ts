import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { environment as env } from "@environments/environment";
import { ISelect } from '@eskhata/util';
import { IAdvanceAccessCode } from "@modules/advance-payments/deal-conditions/interface/advance-access-code";
import { IParam } from "@core/interfaces";

@Injectable()
export class ProductDictionariesService {

  private apiDictionaryUrl = `${env.apiFoodUrl}/${env.api.dictionaries}`;

  private http = inject(HttpClient);

  getCategoryDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiDictionaryUrl}/${env.api.categories}`);
  }

  getUnitDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiDictionaryUrl}/${env.api.inits}`);
  }

  uploadImage(image: FormData): Observable<IHttpResponse<IParam>> {
    return this.http.post<IHttpResponse<IParam>>(`${env.apiFoodUrl}/${env.api.images}/${env.api.upload}`, image);
  }
}
