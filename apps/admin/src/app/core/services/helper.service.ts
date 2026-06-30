import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private http = inject(HttpClient);

  getFile(host: string, fileId: any, fileStorageToken: string): Observable<any> {
    const headers = new HttpHeaders({'Authorization': `Bearer ${fileStorageToken}`});
    return this.http.get(`${host}web/${fileId}`, {headers, responseType: 'blob', observe: 'response'});
  }

}
