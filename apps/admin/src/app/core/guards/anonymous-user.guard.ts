import { inject, Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { AuthService } from '@modules/auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnonymousUserGuard implements CanActivate, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    return this.isAnonymousUser();
  }

  canLoad(): boolean {
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
