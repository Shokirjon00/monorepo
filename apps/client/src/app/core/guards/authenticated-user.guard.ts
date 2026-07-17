import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { AuthService } from "@modules/auth/service/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserGuard implements CanActivate, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);

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
