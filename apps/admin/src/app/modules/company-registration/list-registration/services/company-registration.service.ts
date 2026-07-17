import { inject, Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class CompanyRegistrationApplicationsService {
  form: FormGroup;
  private apiUrl = `${env.apiUrl}/${env.api.companyRegistrationApplications}`;
  private readonly http = inject(HttpClient);

  getCompanyRegistration(queryParams: Params): Observable<IHttpResponse<ICompanyRegistration[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICompanyRegistration[]>>(this.apiUrl, {params});
  }

  getCompanyRegistrationDetail(id: string): Observable<IHttpResponse<ICompanyRegistrationDetail>> {
    return this.http.get<IHttpResponse<ICompanyRegistrationDetail>>(`${this.apiUrl}/${id}`);
  }

  getCompanyRegistrationStatusesDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.companyRegistrationApplicationsStatuses}/${env.api.dictionary}`);
  }

  updateCompanyRegistration(data: ICompanyRegistration): Observable<IHttpResponse<ICompanyRegistration>> {
    return this.http.post<IHttpResponse<ICompanyRegistration>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  componyRegistrationApplication(data: ICompanyRegistration): Observable<IHttpResponse<ICompanyRegistration>> {
    return this.http.post<IHttpResponse<ICompanyRegistration>>(`${this.apiUrl}/${env.api.sendEmail}`, data);
  }

  getUpdateCompanyRegistration(id: string): Observable<IHttpResponse<ICompanyRegistrationDetail>> {
    return this.http.get<IHttpResponse<ICompanyRegistrationDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getComponyRegistrationApplication(id: string): Observable<IHttpResponse<ICompanyRegistration>> {
    return this.http.get<IHttpResponse<ICompanyRegistration>>(`${this.apiUrl}/${env.api.report}/${id}`);
  }

  getCompanyRegistrationApplicationHistories(id: string): Observable<IHttpResponse<ICompanyRegistrationHistory[]>> {
    return this.http.get<IHttpResponse<ICompanyRegistrationHistory[]>>(`${env.apiUrl}/${env.api.companyRegistrationApplicationHistories}/${id}`)
  }
}
