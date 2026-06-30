import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, filter, first } from 'rxjs/operators';
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  version: string;
  path: string;
  private http = inject(HttpClient);
  private router = inject(Router);
  constructor() {
    window.addEventListener('focus', () => this.checkVersion());
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        debounceTime(3000),
      )
      .subscribe(() => this.checkVersion());
  }

  checkVersion(): void {
    if (!this.version || !environment.production) {
      return;
    }
    this.http.get(`${this.path}/version.json?t=${new Date().getTime()}`)
      .pipe(first())
      .subscribe((response: any) => {
        if (response.hasOwnProperty('version') && response.version !== this.version) {
          location.reload();
        }
      });
  }

  setVersion(version: string, path: string = ''): void {
    this.version = version;
    this.path = path;
  }
}
