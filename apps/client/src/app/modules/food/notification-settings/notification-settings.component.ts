import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmHeaderComponent, ToastModule } from '@eskhata/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { MatDialog } from '@angular/material/dialog';
import { NotificationSettingsService } from './services/notification-settings.service';
import { TelegramConnectModalComponent } from './telegram-connect-modal/telegram-connect-modal.component';
import { TelegramSubscriptionStatus } from './interfaces/notification-settings.interface';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';

import { NgxPermissionsModule } from 'ngx-permissions';
import { finalize } from 'rxjs/operators';
import { IHttpResponse } from '@core/interfaces/http-response.interface';

@Component({
  selector: 'em-notification-settings',
  standalone: true,
  imports: [
    EmHeaderComponent,
    SvgIconComponent,
    ToastModule,
    NgxPermissionsModule
],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss',
  providers: [NotificationSettingsService],
})
export class NotificationSettingsComponent implements OnInit {
  subscriptionStatus = signal<TelegramSubscriptionStatus | null>(null);
  isNotificationsEnabled = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isToggling = signal<boolean>(false);
  telegramBotSubscriberId = signal<string | null>(null);
  telegramLink = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(NotificationSettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  readonly showConnectButton = computed(() =>
    this.subscriptionStatus() === TelegramSubscriptionStatus.NOT_REGISTERED
  );

  readonly showVerifyButton = computed(() =>
    this.subscriptionStatus() === TelegramSubscriptionStatus.UNVERIFIED
  );

  readonly showToggle = computed(() => {
    const status = this.subscriptionStatus();
    return status === TelegramSubscriptionStatus.DISABLED ||
      status === TelegramSubscriptionStatus.ENABLED;
  });

  ngOnInit(): void {
    this.checkSubscriptionStatus();
  }


  openConnectModal(): void {
    this.openTelegramModal();
  }

  goToTelegramVerification(): void {
    const subscriberId = this.telegramBotSubscriberId();
    if (subscriberId) {
      this.openTelegramModal({ subscriberId });
    }
  }

  onToggleChange(enabled: boolean): void {
    if (this.isToggling()) {
      return;
    }

    this.isToggling.set(true);

    this.service
      .getRestaurantPointIds()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ids) => this.handleRestaurantPoints(ids, enabled),
        error: () =>
          this.handleToggleError(
            'Ошибка при загрузке точек ресторана',
            enabled
          ),
      });
  }

  private handleRestaurantPoints(
    restaurantPointIds: string[],
    enabled: boolean
  ): void {
    if (!restaurantPointIds.length) {
      this.handleToggleError('Не найдены точки ресторана', enabled);
      return;
    }
    this.updateNotifications(enabled, restaurantPointIds);
  }

  private updateNotifications(
    enabled: boolean,
    restaurantPointIds: string[]
  ): void {
    this.service
      .updateTelegramNotifications(enabled, restaurantPointIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.handleUpdateResponse(res, enabled),
        error: () =>
          this.handleToggleError(
            'Ошибка при обновлении настроек',
            enabled
          ),
      });
  }

  private handleUpdateResponse(
    res: IHttpResponse<any>,
    enabled: boolean
  ): void {
    if (res.status) {
      this.applySuccessState(enabled);
      this.showSuccess('Настройки уведомлений обновлены');
    } else {
      this.isNotificationsEnabled.set(enabled);
      this.showError(res.message || 'Ошибка при обновлении настроек');
    }

    this.isToggling.set(false);
  }

  private handleToggleError(message: string, enabled: boolean): void {
    this.isNotificationsEnabled.set(enabled);
    this.showError(message);
    this.isToggling.set(false);
  }

  private applySuccessState(enabled: boolean): void {
    this.isNotificationsEnabled.set(enabled);
    this.subscriptionStatus.set(
      enabled
        ? TelegramSubscriptionStatus.ENABLED
        : TelegramSubscriptionStatus.DISABLED
    );
  }

  private checkSubscriptionStatus(): void {
    this.isLoading.set(true);

    this.service
      .getTelegramSubscriptionStatus()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.subscriptionStatus.set(res.data.status);
            this.telegramBotSubscriberId.set(
              res.data.telegramBotSubscriberId || null
            );

            this.telegramLink.set(res.data.telegramLink || null);

            this.isNotificationsEnabled.set(
              res.data.status === TelegramSubscriptionStatus.ENABLED
            );
          }
        },
        error: () => {
          this.showError('Ошибка при загрузке статуса подписки');
        },
      });
  }

  private showError(summary: string): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary,
    });
  }

  private showSuccess(summary: string): void {
    this.messageService.add({
      severity: ToastEnum.SUCCESS,
      summary,
    });
  }

  private openTelegramModal(data?: {
    subscriberId?: string;
    telegramLink?: string;
  }): void {
    this.dialog
      .open(TelegramConnectModalComponent, {
        panelClass: 'telegram-connect-dialog',
        width: '450px',
        maxWidth: '90vw',
        data: {
          subscriberId: data?.subscriberId,
          telegramLink: this.telegramLink(),
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.checkSubscriptionStatus();
      });
  }

}
