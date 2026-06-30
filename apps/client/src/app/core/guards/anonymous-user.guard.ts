import { inject, Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from "@modules/auth/service/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AnonymousUserGuard implements CanActivate, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isAnonymousUser();
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.isAnonymousUser();
  }

  private isAnonymousUser(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
