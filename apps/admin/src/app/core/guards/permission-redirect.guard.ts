import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionRedirectGuard implements CanActivate {
  private permissionsService = inject(NgxPermissionsService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.checkPermission(route);
  }

  private checkPermission(route: ActivatedRouteSnapshot): Observable<boolean> {
    const permissionKey = route.data['permissionKey'];
    const redirectPath = route.data['redirectTo'];

    return from(this.permissionsService.hasPermission(permissionKey)).pipe(
      map(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          const parentPath = route.parent?.pathFromRoot
            .flatMap(r => r.url.map(segment => segment.path))
            .join('/') || '';

          const redirectUrl = `/${parentPath}/${redirectPath}`;

          this.router.navigate([redirectUrl], {queryParams: route.queryParams});
          return false;
        }
      })
    );
  }
}
