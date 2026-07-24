import { Component, inject, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TokenService } from '@core/services/token.service';
import { ErrorService } from '@core/services/error.service';
import { AuthService } from '@modules/auth/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { SidebarMenuComponent } from '@modules/main/sidebar-menu/sidebar-menu.component';
import { TopButtonComponent } from '@eskhata/ui';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '@environments/environment';
import {
  NotificationSettingsService
} from '@modules/food/notification-settings/services/notification-settings.service';

@Component({
  standalone: true,
  selector: 'em-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    FormsModule,
    NgxPermissionsModule,
    ClickOutsideModule,
    AngularSvgIconModule,
    SharedModule,
    MatSidenavModule,
    RouterOutlet,
    SidebarMenuComponent,
    TopButtonComponent,
  ],
  providers:[ NotificationSettingsService]
})
export class MainComponent extends DestroyableComponent implements OnInit {
  private app = initializeApp(environment.firebase);
  private readonly authService = inject(AuthService);
  private readonly service = inject(NotificationSettingsService);
  private readonly errorService = inject(ErrorService);
  private readonly tokenService = inject(TokenService);
  private readonly platform = inject(Platform);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly permissionsService = inject(NgxPermissionsService);

  isMenuOpen = true;
  isMobile = this.platform.IOS || this.platform.ANDROID;
  mode: MatDrawerMode = this.isMobile ? 'over' : 'side';

  ngOnInit(): void {
    this.handleTelegramConfirmAfterLogin();
    this.showEndSessionModal();
    this.initializeFirebaseNotifications();
  }

  private showEndSessionModal(): void {
    this.authService.endSession$
      .pipe(
        switchMap(() => this.errorService.showAlert({title: 'Время сеанса истекло'})),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.dialog.closeAll();
        this.navigateToLogin();
      });
  }

  /**
   * navigate to login page
   */
  private navigateToLogin(): void {
    this.tokenService.clearTokens();
    this.authService.temporaryToken = null;
    this.router.navigate(['/auth']).catch();
  }

  /**
   * Инициализация Firebase push-уведомлений
   */
  private initializeFirebaseNotifications(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          this.requestNotificationPermission();
          this.listenToNotifications();
        })
    }
  }

  /**
   * Запрос разрешений на push-уведомления
   */
  private requestNotificationPermission(): void {
    this.permissionsService.hasPermission('FirebaseNotifications')
      .then(hasPermission => {
        if (!hasPermission) return;

        const messaging = getMessaging(this.app);
        getToken(messaging, {vapidKey: environment.firebase.vapidKey})
          .then(token => {
            if (token) {
              console.log('Hurraaa!!! we got the token.....');
              this.authService.setToken(token).subscribe();
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          })
      });
  }

  /**
   * Слушатель push-сообщений
   */
  private listenToNotifications(): void {
    const messaging = getMessaging(this.app);

    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);

      const notificationTitle = payload.notification?.title;
      const notificationOptions: NotificationOptions = {
        body: payload.notification?.body,
        icon: 'assets/logo.svg',
      };

      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(notificationTitle, notificationOptions);
        });
      }
    });
  }

  private handleTelegramConfirmAfterLogin(): void {
    const token = sessionStorage.getItem('telegramConfirmToken');

    if (!token) return;

    this.service
      .confirmSubscriber(token)
      .subscribe({
        next: () => {
          sessionStorage.removeItem('telegramConfirmToken');
        },
        error: () => {
        },
      });
  }

}
