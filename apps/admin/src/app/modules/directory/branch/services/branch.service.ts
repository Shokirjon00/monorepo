import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {environment as env} from 'environments/environment';
import {ISelect} from '@core/interfaces/select.interface';
import {IBranch} from '@modules/directory/branch/interfaces/branch.interface';
import {IBranchDetail} from '@modules/directory/branch/interfaces/branch-detail.interface';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private apiUrl = `${env.apiUrl}/${env.api.branches}`;
  private readonly http = inject(HttpClient);

  getBranches(queryParams: Params): Observable<IHttpResponse<IBranch[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IBranch[]>>(this.apiUrl, {params});
  }

  getBranchById(id: string): Observable<IHttpResponse<IBranchDetail>> {
    return this.http.get<IHttpResponse<IBranchDetail>>(`${this.apiUrl}/${id}`);
  }

  getBranchDetail(id: string): Observable<IHttpResponse<IBranchDetail>> {
    return this.http.get<IHttpResponse<IBranchDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  getBranchDictionary(queryParams:Params): Observable<IHttpResponse<ISelect[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`,{params});
  }

  getBranchDictionaryWithoutPagination(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionaryWithoutPagination}`,{});
  }

  updateBranch(data: IBranchDetail): Observable<IHttpResponse<IBranchDetail>> {
    return this.http.post<IHttpResponse<IBranchDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createBranch(data: IBranchDetail): Observable<IHttpResponse<IBranchDetail>> {
    return this.http.post<IHttpResponse<IBranchDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

}
