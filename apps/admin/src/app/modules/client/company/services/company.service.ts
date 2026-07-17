import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICompanyDetail } from '../interfaces/company-detail.interface';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { environment as env } from '@environments/environment';
import { ISelect } from '@core/interfaces/select.interface';
import { ICompany, ISearchClient } from '@modules/client/company/interfaces/company.interface';
import { Params } from '@angular/router';
import { IAcquirer } from '@core/interfaces/acquirer.interface';
import {IParam} from "@core/interfaces";

@Injectable()
export class CompanyService {

  private apiUrl = `${env.apiUrl}/${env.api.companies}`;
  private apiEqmsUrl = `${env.apiUrl}/${env.api.eqms}`;
  private http  = inject(HttpClient);

  getCompanies(queryParams: Params): Observable<IHttpResponse<ICompany[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ICompany[]>>(this.apiUrl, {params});
  }

  getDetail(id: string): Observable<IHttpResponse<ICompanyDetail>> {
    return this.http.get<IHttpResponse<ICompanyDetail>>(`${this.apiUrl}/${id}`);
  }

  getUpdateDetail(id: string): Observable<IHttpResponse<ICompanyDetail>> {
    return this.http.get<IHttpResponse<ICompanyDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateCompany(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${env.api.update}`, data);
  }

  createCompany(data: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getCompanyDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }

  getContractTemplate(): Observable<IHttpResponse<any>> {
    return this.http.get<IHttpResponse<any>>(`${this.apiUrl}/${env.api.contractTemplate}`);
  }

  searchClient(data: ISearchClient): Observable<IHttpResponse<{ jobLogId: string }>> {
    return this.http.post<IHttpResponse<{ jobLogId: string }>>(`${this.apiUrl}/${env.api.searchClient}`, data);
  }

  getCompanyAcquirers(companyId: string, queryParams: Params): Observable<IHttpResponse<IAcquirer[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IAcquirer[]>>(`${env.apiUrl}/${env.api.companyAcquirers}/${companyId}`, {params});
  }

  createCompanyAcquirer(data: { companyId: string, bankId: string }): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${env.apiUrl}/${env.api.companyAcquirers}/${env.api.create}`, data);
  }

  deleteCompanyAcquirer(id: string): Observable<IHttpResponse<ICompanyDetail>> {
    return this.http.post<IHttpResponse<ICompanyDetail>>(`${env.apiUrl}/${env.api.companyAcquirers}/${env.api.delete}/${id}`, {});
  }

  getCompanyPossPhoneNumber(companyId: string): Observable<IHttpResponse<{posPhoneNumbers: string[]}>> {
    return this.http.get<IHttpResponse<{posPhoneNumbers: string[]}>>(`${this.apiUrl}/${env.api.posPhoneNumbers}/${companyId}`);
  }

  sendTelegramLink(form: any): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.sendTelegramLink}`, form);
  }

  addFile(file: FormData, url: string): Observable<any> {
    return this.http.post<IHttpResponse<any>>(
      `${env.apiUrl}/${url}`,
      file,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  syncCompanyAcquirer(id: any): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${env.apiUrl}/${env.api.eqms}/${env.api.companyAquarerSync}`, id);
  }

  syncWithIft(companyId: { companyId: string }): Observable<IHttpResponse<IParam>> {
    return this.http.post<IHttpResponse<IParam>>(`${this.apiEqmsUrl}/${env.api.companySync}`, companyId);
  }

  getCompanyById(id: string): Observable<IHttpResponse<ISelect>> {
    return this.http.get<IHttpResponse<ISelect>>(`${this.apiUrl}/${id}`);
  }
}
