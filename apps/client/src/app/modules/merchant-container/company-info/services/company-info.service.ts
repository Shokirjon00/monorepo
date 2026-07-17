import { inject, Injectable } from '@angular/core';
import {environment as env} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {ICompanyInfo} from "@modules/merchant-container/company-info/interfaces/company-info.interface";

@Injectable()

export class CompanyInfoService {
  private apiUrl = `${env.apiUrl}/${env.api.companies}`;
  private http = inject(HttpClient);

  getCompanyInfo(): Observable<IHttpResponse<ICompanyInfo>> {
    return this.http.get<IHttpResponse<ICompanyInfo>>(`${this.apiUrl}`);
  }

  getCompanyPossPhoneNumber(companyId: string): Observable<IHttpResponse<{posPhoneNumbers: string[]}>> {
    return this.http.get<IHttpResponse<{posPhoneNumbers: string[]}>>(`${this.apiUrl}/${env.api.posPhoneNumbers}/${companyId}`);
  }

  sendTelegramLink(form: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.sendTelegramLink}`, form);
  }
}
