import {inject, Injectable} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {environment as env} from "@environments/environment";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {ICompanyRegistration} from "@modules/company-registration/list-registration/interfaces/company-registration.interfaces";
import {ICompanyRegistrationDetail} from "@modules/company-registration/list-registration/interfaces/company-registration-detail.interfaces";
import {ISelect} from "@core/interfaces/select.interface";
import {ICompanyRegistrationHistory} from "@modules/company-registration/list-registration/interfaces/company-registration-history.interfaces";
import {
  IRetailOutlet,
  IRetailOutletChangeStatus
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet.interfaces";
import {
  IIRetailOutletDetail
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet-detail.interfaces";
import {ICountryDetail} from "@modules/directory/country/interfaces/country-detail.interface";
import {
  IRetailOutletHistory
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet-history.interfaces";

@Injectable({
  providedIn: 'root'
})
export class RetailOutletService {
  form: FormGroup;
  private apiUrl = `${env.apiUrl}/${env.api.merchantApplications}`;
  private apiUrlStatuses = `${env.apiUrl}/${env.api.merchantApplicationsStatuses}`;
  private http = inject(HttpClient)

  getRetailOutlet(queryParams: Params): Observable<IHttpResponse<IRetailOutlet[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IRetailOutlet[]>>(this.apiUrl, {params});
  }

  getRetailOutletDetail(id: string): Observable<IHttpResponse<IIRetailOutletDetail>> {
    return this.http.get<IHttpResponse<IIRetailOutletDetail>>(`${this.apiUrl}/${id}`);
  }

  getRetailOutletHistories(id: string): Observable<IHttpResponse<IRetailOutletHistory[]>> {
    return this.http.get<IHttpResponse<IRetailOutletHistory[]>>(`${this.apiUrl}/${id}/${env.api.history}`)
  }

  changeStatus(): Observable<IHttpResponse<IRetailOutletChangeStatus[]>> {
    return this.http.get<IHttpResponse<IRetailOutletChangeStatus[]>>(`${this.apiUrlStatuses}/${env.api.dictionary}`);
  }

  sendStatus(data: any): Observable<IHttpResponse<IRetailOutletChangeStatus[]>> {
    return this.http.post<IHttpResponse<IRetailOutletChangeStatus[]>>(`${this.apiUrl}/${env.api.changeStatus}`, data);
  }
}
