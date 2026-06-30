import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@modules/auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserGuard implements CanActivate, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isAuthenticatedUser(state.url);
  }

  canLoad(): boolean {
    return this.isAuthenticatedUser();
  }

  private isAuthenticatedUser(url?: string): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login'], {queryParams: {returnUrl: url}}).catch();
    return false;
  }
}
