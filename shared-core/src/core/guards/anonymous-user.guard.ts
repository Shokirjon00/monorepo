import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@shared-core/data-access/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnonymousUserGuard implements CanActivate, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isAnonymousUser();
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.isAnonymousUser();
  }

  private isAnonymousUser(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']).catch();
      return false;
    }
    return true;
  }
}
