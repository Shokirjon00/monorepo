import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { IBankIntegration } from "@modules/directory/bank/interfaces/bank.interface";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ISelect } from "@core/interfaces";

@Injectable()
export class BankIntegrationConfigurationsService {
  private apiUrl = `${env.apiUrl}/${env.api.bankIntegrationConfigurations}`;
  private apiAccessTypesUrl = `${env.apiUrl}/${env.api.externalApiAccessTypes}`;
  private readonly http = inject(HttpClient);

  getGatewaysSetup(id: string): Observable<IHttpResponse<IBankIntegration>> {
    return this.http.get<IHttpResponse<IBankIntegration>>(`${this.apiUrl}/${id}`);
  }

  update(data: IBankIntegration): Observable<IHttpResponse<IBankIntegration>> {
    return this.http.post<IHttpResponse<IBankIntegration>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  getAccessTypesId(): Observable<IHttpResponse<IBankIntegration[]>> {
    return this.http.get<IHttpResponse<IBankIntegration[]>>(`${this.apiAccessTypesUrl}/${env.api.dictionary}`);
  }
}
