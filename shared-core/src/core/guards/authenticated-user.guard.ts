import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { TokenService } from './../../data-access/token.service';
import { AuthService } from '@shared-core/data-access/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserGuard implements CanActivate, CanLoad {

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isAuthenticatedUser(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.isAuthenticatedUser();
  }

  private isAuthenticatedUser(url?: string): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login'], {queryParams: {returnUrl: url}});
    return false;
  }
}
