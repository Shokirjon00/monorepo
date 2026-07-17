import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { VersionService } from '@core/services/version.service';
import { environment } from '@environments/environment';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GoogleMapsModule } from '@angular/google-maps';
import { AuthService } from '@modules/auth/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AdvanceOfferDialogComponent } from '@shared/dialogs/advance-offer-dialog/advance-offer-dialog.component';
import { take, timer } from 'rxjs';
import { AdvanceOfferService } from '@shared/dialogs/advance-offer-dialog/service/advance-offer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs/operators';
import { IParam } from '@core/interfaces';
import { setToLocalStorage } from '@core/utils';
import { SessionStorageService } from '@core/services/session-storage.service';

@Component({
  standalone: true,
  selector: 'em-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterModule,
    NgxPermissionsModule,
    AngularSvgIconModule,
    FormsModule,
    NgApexchartsModule,
    GoogleMapsModule,
  ],
  providers: [AdvanceOfferService],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'EskhataAcquringWebClient';
  offerData: IParam;
  private offerRequested = false;

  private readonly permissionService = inject(NgxPermissionsService);
  private readonly versionService = inject(VersionService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly offer = inject(AdvanceOfferService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly storage = inject(SessionStorageService)

  ngOnInit(): void {
    this.handleTelegramTokenFromHash();
    this.checkVersion();
    this.setPermissions();
    window.addEventListener('load', this.loadStyle.bind(this));
    this.getOfferOnceOnStableNavigation();
  }

  ngOnDestroy(): void {
    window.removeEventListener('load', this.loadStyle.bind(this));
  }

  checkVersion(): void {
    this.versionService.setVersion(environment.version, '');
  }

  private shouldFetchOffer(): boolean {
    const url = this.router.url;
    return !url.startsWith('/auth') && !url.startsWith('/advance-payments') && this.authService.isAuthenticated();
  }

  private getOfferOnceOnStableNavigation(): void {
    if (this.offerRequested) {
      return;
    }

    if (this.shouldFetchOffer()) {
      this.getOffer();
      this.offerRequested = true;
      return;
    }
    this.watchNavigationAndFetchOffer();
  }

  private watchNavigationAndFetchOffer(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter(() => this.shouldFetchOffer() && !this.offerRequested),
        tap(() => {
          this.getOffer();
          this.offerRequested = true;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private getOffer(): void {
    this.offer
      .getAdvancePayoutOffer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.offerData = res;
        if (res?.status != null) {
          setToLocalStorage('offerStatus', res.status);
        }
        if (res?.status === true) {
          timer(1000)
            .pipe(take(1))
            .subscribe(() => {
              if (this.shouldFetchOffer()) {
                this.dialog.open(AdvanceOfferDialogComponent, {
                  width: '600px',
                  disableClose: true,
                  data: this.offerData,
                });
              }
            });
        }
      });
  }

  private loadStyle(): void {
    appendStyle('late-styles.css');
  }

  private setPermissions(): void {
    const permissions = JSON.parse(sessionStorage.getItem('permissions'));

    if (permissions) {
      this.permissionService.loadPermissions(permissions);
    }
  }

  private handleTelegramTokenFromHash(): void {
    const hash = window.location.hash;
    console.log('hash', hash);

    if (!hash.includes('token=')) return;

    const queryString = hash.split('?')[1];
    if (!queryString) return;

    const params = new URLSearchParams(queryString);
    const token = params.get('token');

    if (!token) return;

    this.storage.set('telegramConfirmToken', token);
  }
}

function appendStyle(name: string): void {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = name;
  document.head.appendChild(style);
}
