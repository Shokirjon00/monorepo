import { inject, Injectable } from '@angular/core';
import { ACCESS_TOKEN_KEY, DEVICE_ID, REFRESH_TOKEN_KEY } from '@core/helper';
import { IToken } from '@core/interfaces/token.interface';
import { LocalStorageService } from '@core/services/local-storage.service';
import { Subject } from 'rxjs';
import { IHttpResponseMeta } from '@core/interfaces/http-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  refreshedToken$: Subject<boolean> = new Subject();

  private _accessToken: string;
  private _refreshToken: string;
  private storage = inject(LocalStorageService);

  get accessToken(): string {
    if (!this._accessToken) {
      this._accessToken = this.storage.get(ACCESS_TOKEN_KEY);
    }
    return this._accessToken;
  }

  get refreshToken(): string {
    if (!this._refreshToken) {
      this._refreshToken = this.storage.get(REFRESH_TOKEN_KEY);
    }
    return this._accessToken;
  }

  /**
   * set tokens
   */
  setTokens(meta: IHttpResponseMeta): void {
    this._accessToken = meta.accessToken;
    this._refreshToken = meta.refreshToken;
    this.storage.set(ACCESS_TOKEN_KEY, meta.accessToken);
    this.storage.set(REFRESH_TOKEN_KEY, meta.refreshToken);
    this.refreshedToken$.next(true);
  }

  /**
   * get tokens
   */
  getTokens(): IToken {
    return {
      accessToken: this.storage.get(ACCESS_TOKEN_KEY),
      refreshToken: this.storage.get(REFRESH_TOKEN_KEY),
    };
  }

  /**
   * clear tokens
   */
  clearTokens(): void {
    this.storage.remove(ACCESS_TOKEN_KEY);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this._accessToken = null;
    this._refreshToken = null;
  }

}
